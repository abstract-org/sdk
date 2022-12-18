import sha256 from 'crypto-js/sha256'
import HashMap from 'hashmap'

import Pool from './Pool'
import Token from './Quest'
import { isE10Zero, p2pp } from '../../../utils/logicUtils'

export default class Investor {
    hash = null
    type = null
    name = null
    default = false
    balances = { USDC: 0 } // not like solidity, what's better -> balances here or in tokens
    initialBalance = 0
    positions = new HashMap()
    questsCreated = []
    balancesLogs = []

    private PRICE_RANGE_MULTIPLIER = 2

    /**
     * @description Instantiates new Investor with params
     * @param {string} type
     * @param {string} name
     * @param {number} usdcBalance
     * @param _default
     * @returns {Investor}
     */
    static create(type, name, usdcBalance = 10000, _default = false) {
        const thisInvestor = new Investor()
        thisInvestor.hash = '0x' + sha256(`${name} + ${type}`)
        thisInvestor.balances.USDC = parseFloat(`${usdcBalance}`)
        thisInvestor.initialBalance = parseFloat(`${usdcBalance}`)
        thisInvestor.type = type
        thisInvestor.name = name
        thisInvestor.default = _default

        return thisInvestor
    }

    createQuest(name) {
        const quest = Token.create(name)
        this.questsCreated.push(quest.name)
        return quest
    }

    addBalance(tokenName, balance, msg = null) {
        if (isNaN(balance)) {
            console.log('Trying to pass NaN amount', tokenName, balance, msg)
            return false
        }

        if (isE10Zero(balance) || balance === 0) {
            return false
        }

        if (!this.balances[tokenName]) {
            this.balances[tokenName] = 0
        }

        if (this.balances[tokenName] + balance < 0) {
            console.log(
                `You don't have ${balance} of ${tokenName} to spend, remaining amount is ${this.balances[tokenName]}`,
                msg
            )
            return false
        }

        const prevBalance = this.balances[tokenName]
        this.balances[tokenName] += balance
        this.balancesLogs.push({
            tokenName,
            dir: balance > 0 ? 'in' : 'out',
            shift: balance,
            was: prevBalance,
            now: this.balances[tokenName],
            msg
        })

        if (isE10Zero(this.balances[tokenName])) {
            this.balances[tokenName] = 0
        }

        return true
    }

    removeLiquidity(pool, priceMin, priceMax, amountLeft = 0, amountRight = 0) {
        return this.modifyPosition(
            pool,
            priceMin,
            priceMax,
            amountLeft,
            amountRight
        )
    }

    private modifyPosition(pool, priceMin, priceMax, amountLeft = 0, amountRight = 0) {
        const liquidity = pool.getLiquidityForAmounts(
            amountLeft,
            amountRight,
            Math.sqrt(priceMin),
            Math.sqrt(priceMax),
            Math.sqrt(pool.curPrice)
        )
        pool.modifyPositionSingle(p2pp(priceMin), liquidity)
        pool.modifyPositionSingle(p2pp(priceMax), -liquidity)

        this.positions.set(pool.name, pool.pos.values())

        if (pool.curPrice <= priceMax && pool.curPrice >= priceMin) {
            pool.curLiq += liquidity
        }

        const amounts = pool.getAmountsForLiquidity(
            liquidity,
            Math.sqrt(priceMin),
            Math.sqrt(priceMax),
            Math.sqrt(pool.curPrice)
        )

        pool.volumeToken0 -= amounts[0]
        pool.volumeToken1 -= amounts[1]

        return amounts
    }

    createPool(citedToken, citingToken, startingPrice) {
        if (!citedToken || !citingToken) {
            throw new Error('You must provide both tokens to create cross pool')
        }

        return Pool.create(citedToken, citingToken, startingPrice)
    }

    /**
     * @param {Object} crossPool
     * @param {number} priceMin
     * @param {number} priceMax
     * @param {number} token0Amt
     * @param {number} token1Amt
     * @returns {*[]}
     */
    citeQuest(
        crossPool,
        priceMin = 1,
        priceMax = 10,
        token0Amt = 0,
        token1Amt = 0,
        native
    ) {
        // Open "position" for value link pool
        const [totalIn, totalOut] = crossPool.openPosition(
            priceMin,
            priceMax,
            token0Amt,
            token1Amt,
            native
        )

        if (
            typeof token0Amt === 'undefined' ||
            typeof token1Amt === 'undefined' ||
            (token0Amt === 0 && token1Amt === 0)
        ) {
            console.warn('### ALERT: CITATION INVESTOR ###')
            console.warn(
                `During citation at ${crossPool.name} with pos[${priceMin}...${priceMax}] direction native=${native}, tokens passed token0: ${token0Amt}, token1: ${token1Amt}`
            )
            console.warn(`Got response: in: ${totalIn}/out:${totalOut}`)
            return null
        }

        if (!totalIn && !totalOut) {
            return null
        }

        crossPool.posOwners.push({
            hash: this.hash,
            pmin: priceMin,
            pmax: priceMax,
            amt0: token0Amt,
            amt1: token1Amt,
            type: 'investor',
            native
        })
        this.positions.set(crossPool.name, crossPool.pos.values())

        return [totalIn, totalOut]
    }

    /**
     * @param {Pool} crossPool
     * @param {Pool} citedQuestPool
     * @param {Pool} citingQuestPool
     * @param {number} multiplier
     * @returns {object{min: number, max: number}}
     * @description Preferred base unit of price range is B/A (cited/citing)
     */
    calculatePriceRange(
        crossPool,
        citedQuestPool,
        citingQuestPool,
        multiplier = this.PRICE_RANGE_MULTIPLIER
    ) {
        const baseUnitName = crossPool.name
        const baseUnitCompName = `${citedQuestPool.tokenRight}-${citingQuestPool.tokenRight}`
        const nativePos = baseUnitName !== baseUnitCompName

        let min = 0
        let max = 0
        let unitPrice = 0

        if (!nativePos) {
            unitPrice = citingQuestPool.curPrice / citedQuestPool.curPrice
        } else {
            unitPrice = citedQuestPool.curPrice / citingQuestPool.curPrice
        }

        if (unitPrice <= 0) {
            min = 0
            max = 0
        }

        if (nativePos) {
            max = 1 / unitPrice
            min = 1 / (max / multiplier)
        } else {
            min = unitPrice
            max = min * multiplier
        }

        // Try to correct rounding errors
        if (nativePos) {
            min -= 0.0000000000000000001
            max -= 0.0000000000000000001
        }

        // Dry swap in both directions to determine if we can shift curPrice for "free"
        const dryBuyNonNative = crossPool.dryBuy(Infinity)
        const drySellNative = crossPool.drySell(Infinity)
        const freeMoveBuy = dryBuyNonNative[0] === 0 && dryBuyNonNative[1] === 0
        const freeMoveSell = drySellNative[0] === 0 && drySellNative[1] === 0

        // If we can move for free towards requested price, set that price as curPrice
        if (nativePos && max > crossPool.curPrice && freeMoveSell) {
            crossPool.curPrice = max
        } else if (!nativePos && min < crossPool.curPrice && freeMoveBuy) {
            crossPool.curPrice = min
        }

        if (nativePos) {
            if (max <= crossPool.curPrice) {
                min = max / multiplier
            } else if (max > crossPool.curPrice) {
                min = max / multiplier
                max = crossPool.curPrice
            }
        } else {
            if (min >= crossPool.curPrice) {
                max = min * multiplier
            } else if (min < crossPool.curPrice) {
                // Change the calculation of min and max when nativePos is false and crossPool.curPrice is higher than the calculated min
                min = crossPool.curPrice / multiplier
                max = crossPool.curPrice
            }
        }

        // Left it here to test if it's still an issue or not
        console.assert(
            min < max,
            'priceMin (%s) is higher than priceMax (%s), skipping position opening for %s, unit price %s, direction native=%s',
            min,
            max,
            crossPool.name,
            unitPrice,
            nativePos
        )

        if (min > max) {
            console.warn(crossPool)
            console.warn(citedQuestPool)
            console.warn(citingQuestPool)
            console.warn(dryBuyNonNative, drySellNative)
            console.warn(nativePos)
        }

        if (min > max) {
            return
        }

        return { min: min, max: max, native: nativePos }
    }
}