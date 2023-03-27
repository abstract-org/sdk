import sha256 from 'crypto-js/sha256'
import Hex from 'crypto-js/enc-hex'
import HashMap from 'hashmap'
import { isE10Zero, isNearZero, isZero, p2pp, pp2p } from '../utils/logicUtils'
import { Quest } from './Quest'
import { IPoolState } from '../interfaces'

const TEMP_CONFIG = {
    PRICE_MIN: 0,
    PRICE_MAX: 1000000.00001,
    JOURNAL: false,
    JOURNAL_BUY: false,
    JOURNAL_SELL: false
}

interface Position {
    liquidity?: number
    left?: number
    pp?: number
    right?: number
}

export class Pool {
    id: number
    name: string
    hash: string

    tokenLeft
    tokenRight

    curLeft = p2pp(TEMP_CONFIG.PRICE_MIN)
    curRight = p2pp(TEMP_CONFIG.PRICE_MAX)
    curPrice = 0
    curPP = Math.log2(1)
    curLiq = 0

    totalSold = 0

    questLeftPrice = 0
    questRightPrice = 0

    questLeftVolume = 0
    questRightVolume = 0

    soldToken0 = 0
    soldToken1 = 0

    pos = new HashMap<any, any>()
    posOwners = []

    type = 'value-link'
    kind = null
    private dryState: IPoolState | object = {}

    /**
     * @description Instantiates new Pool with params
     * @param {Object} tokenLeft
     * @param {Object} tokenRight
     * @param startingPrice
     * @returns {Pool}
     */
    static create(tokenLeft: Quest, tokenRight: Quest, startingPrice) {
        const thisPool = new Pool()
        if (typeof tokenLeft !== 'object' || typeof tokenRight !== 'object')
            throw new Error('Tokens must be an instance of a Token')
        if (tokenLeft.name === tokenRight.name)
            throw new Error('Tokens should not match')

        thisPool.tokenLeft = tokenLeft.name
        thisPool.tokenRight = tokenRight.name

        thisPool.hash = Hex.stringify(
            sha256(tokenLeft.hash + '' + tokenRight.hash)
        )
        thisPool.name = `${tokenLeft.name}-${tokenRight.name}`

        if (tokenLeft.name === 'USDC' || tokenRight.name === 'USDC') {
            thisPool.type = 'quest'
        }

        thisPool.initializePoolBoundaries()

        if (startingPrice) {
            thisPool.curPrice = startingPrice
        }

        return thisPool
    }

    initializePoolBoundaries() {
        // Define default price boundaries
        this.pos.set(p2pp(TEMP_CONFIG.PRICE_MIN), {
            // starts with PRICE_MIN
            liquidity: 0,
            left: p2pp(TEMP_CONFIG.PRICE_MIN),
            pp: p2pp(TEMP_CONFIG.PRICE_MIN),
            right: this.curPP
        })

        this.pos.set(this.curPP, {
            // starts with PRICE_MIN
            liquidity: 0,
            left: p2pp(TEMP_CONFIG.PRICE_MIN),
            pp: this.curPP,
            right: p2pp(TEMP_CONFIG.PRICE_MAX)
        })

        this.pos.set(p2pp(TEMP_CONFIG.PRICE_MAX), {
            liquidity: 0,
            left: this.curPP,
            pp: p2pp(TEMP_CONFIG.PRICE_MAX),
            right: p2pp(TEMP_CONFIG.PRICE_MAX)
        })
    }

    convertPosValue(value: any): number {
        if (value === null || value === '-Infinity') {
            return -Infinity
        } else if (value === 'Infinity') {
            return Infinity
        } else {
            return Number(value)
        }
    }

    hydratePositions(positions) {
        let priceMin = Infinity

        if (positions) {
            positions.forEach((position) => {
                const pos: any = Object.fromEntries(
                    Object.entries(position).map(([key, value]) => [
                        key,
                        this.convertPosValue(value)
                    ])
                )

                this.pos.set(pos.pp, {
                    left: pos.left,
                    right: pos.right,
                    pp: pos.pp,
                    liquidity: pos.liquidity
                })

                if (
                    pp2p(pos.pp) < priceMin &&
                    pp2p(pos.pp) > TEMP_CONFIG.PRICE_MIN
                ) {
                    priceMin = pp2p(pos.pp)
                }
            })
            this.setActiveLiq(priceMin, false)
        }
    }

    setPositionSingle(price, liquidity) {
        this.pos.forEach((position, point) => {
            // setting priceMin liquidity positions
            if (point < price && price <= position.right && liquidity > 0) {
                let newPosition: Position = {}
                if (this.pos.has(price)) {
                    newPosition = this.pos.get(price)
                    newPosition.liquidity += liquidity
                } else {
                    newPosition = {
                        liquidity,
                        left: point,
                        pp: price,
                        right: position.right
                    }

                    const nextId = this.pos.get(point).right
                    const next = this.pos.get(nextId)

                    next.left = price
                    position.right = price

                    this.pos.set(point, position)
                    this.pos.set(nextId, next)
                }

                this.pos.set(price, newPosition)

                // setting priceMax liquidity positions
            } else if (
                point > price &&
                position.left <= price &&
                liquidity < 0
            ) {
                let newPosition: Position = {}

                if (this.pos.has(price)) {
                    newPosition = this.pos.get(price)
                    newPosition.liquidity += liquidity
                } else {
                    newPosition = {
                        liquidity,
                        left: position.left,
                        pp: price,
                        right: point
                    }

                    const next = this.pos.get(point)
                    const prev = this.pos.get(next.left)

                    prev.right = price
                    this.pos.set(next.left, prev)

                    next.left = price
                    this.pos.set(point, next)
                }

                this.pos.set(price, newPosition)
            }

            if (price > this.curLeft && price < this.curPP) {
                this.curLeft = price
            }

            if (price > this.curPP && price < this.curRight) {
                this.curRight = price
            }
        })
    }

    // Remove liquidity partially/fully
    modifyPositionSingle(price, liquidity) {
        if (!this.pos.has(price)) {
            return
        }

        let newPosition: Position = {}
        const point = this.pos.get(price)
        const removeAllLiq = Math.abs(liquidity) >= Math.abs(point.liquidity)

        if (!removeAllLiq) {
            newPosition = this.pos.get(price)
            newPosition.liquidity -= liquidity

            this.pos.set(price, newPosition)
        } else {
            const nextId = this.pos.get(price).right
            const next = this.pos.get(nextId)
            const prevId = this.pos.get(price).left
            const prev = this.pos.get(prevId)

            next.left = prevId
            prev.right = nextId

            this.pos.set(nextId, next)
            this.pos.set(prevId, prev)
            this.pos.delete(price)
        }
    }

    /**
     * @description Opens position in the provided price range and adding provided amount of tokens into pool with calculated liquidity
     * @param {number} priceMin
     * @param {number} priceMax
     * @param {number} token0Amt
     * @param {number} token1Amt
     * @param {boolean} native
     * @returns {[number, number]}
     */
    openPosition(
        priceMin,
        priceMax,
        token0Amt = 0,
        token1Amt = 0,
        native = false
    ) {
        let amounts = []
        let amount1 = 0

        // @TODO: Shift pool price before calculation liquidity if free in either direction
        //const canShiftPriceUp = this.dryBuy(Infinity, this.curPrice)
        //const canShiftPriceDown = this.drySell(Infinity, priceMin)

        // Cannot open position non-native below curPrice
        if (priceMin < this.curPrice && !native) {
            priceMin = this.curPrice + 0.000000000000001

            // Likewise cannot open native position with priceMax above current price
        } else if (priceMax > this.curPrice && native) {
            priceMax = this.curPrice - 0.000000000000001
        }

        const liquidity = this.getLiquidityForAmounts(
            token0Amt,
            token1Amt,
            Math.sqrt(priceMin),
            Math.sqrt(priceMax),
            Math.sqrt(this.curPrice)
        )

        if (liquidity === 0) {
            return []
        }

        this.questLeftVolume += isZero(token0Amt) ? 0 : token0Amt
        this.questRightVolume += isZero(token1Amt) ? 0 : token1Amt

        this.setPositionSingle(p2pp(priceMin), liquidity)
        this.setPositionSingle(p2pp(priceMax), -liquidity)

        if (this.curPrice >= priceMin && this.curPrice <= priceMax) {
            this.curLiq += liquidity
        }

        amounts = this.getAmountsForLiquidity(
            liquidity,
            Math.sqrt(priceMin),
            Math.sqrt(priceMax),
            Math.sqrt(this.curPrice)
        )

        if (amount1 > 0) {
            amounts[1] = amount1
        }

        // Flip return in/out indicator if non-native citation
        if (!native && amounts[0] === 0) {
            amounts[0] = amounts[1]
            amounts[1] = amounts[1] - amounts[0]
        }

        // Native direction needs to pick position at priceMax and set it instead, removing liquidity
        this.setActiveLiq(priceMin, native)

        return amounts
    }

    setActiveLiq(pMin, native) {
        if (
            pp2p(this.curPP) !== this.curPrice ||
            (this.curLiq === 0 && isE10Zero(this.questRightVolume)) ||
            isNearZero(this.questRightVolume)
        ) {
            const ppNext =
                pMin <= this.curPrice
                    ? this.findActiveLiq('left', native)
                    : null
            const ppPrev = !ppNext ? this.findActiveLiq('right', native) : null

            const toPP = ppNext ? ppNext : ppPrev ? ppPrev : null

            if (toPP) {
                const newLiq = this.curLiq + toPP.liquidity
                this.curPP = toPP.pp
                this.curLeft = toPP.left
                this.curRight = toPP.right
                this.curLiq = newLiq <= 0 ? 0 : toPP.liquidity
                this.curPrice = pp2p(toPP.pp)
                this.questLeftPrice = 1 / this.curPrice
                this.questRightPrice = this.curPrice
            }
        }
    }

    findActiveLiq(dir, native = false) {
        let localPP = this.curPP

        while (
            this.pos.get(localPP) &&
            this.pos.get(localPP)[dir] !== 'undefined' &&
            localPP !== this.pos.get(localPP)[dir]
        ) {
            if (!native && this.pos.get(localPP).liquidity > 0) {
                return this.pos.get(localPP)
            } else if (native && this.pos.get(localPP).liquidity < 0) {
                return this.pos.get(localPP)
            }

            localPP = this.pos.get(localPP)[dir]
        }

        return null
    }

    getNearestActiveLiq(zeroForOne) {
        if (this.curLiq > 0) {
            return [
                this.curLiq,
                this.curPrice,
                zeroForOne ? this.curRight : this.curPP
            ]
        }

        let nextActiveLiqPos
        let liq = this.curLiq
        let price = this.curPrice
        let next = zeroForOne ? this.curRight : this.curPP

        if (zeroForOne && p2pp(price) >= next) {
            nextActiveLiqPos = this.findActiveLiq('right')
        } else {
            nextActiveLiqPos = this.findActiveLiq('left')
        }

        if (!nextActiveLiqPos || nextActiveLiqPos.liquidity <= 0) {
            return null
        }

        if (zeroForOne) {
            liq = nextActiveLiqPos.liquidity
            price = pp2p(nextActiveLiqPos.pp)
            next = nextActiveLiqPos.right
        } else {
            liq = nextActiveLiqPos.liquidity
            price = pp2p(nextActiveLiqPos.right)
            next = nextActiveLiqPos.pp
        }

        return [liq, price, next]
    }

    /**
     * @TODO: Returns mixed liquidities when both tokens provided??
     * @param {number} token0
     * @param {number} token1
     * @param {number} sqrtPriceMin
     * @param {number} sqrtPriceMax
     * @param {number} currentSqrtPrice
     * @returns {number}
     */
    getLiquidityForAmounts(
        token0,
        token1,
        sqrtPriceMin,
        sqrtPriceMax,
        currentSqrtPrice
    ) {
        const liquidity0 = token0 / (currentSqrtPrice - sqrtPriceMin)
        const liquidity1 = token1 / (1 / sqrtPriceMin - 1 / sqrtPriceMax)

        if (currentSqrtPrice <= sqrtPriceMin) {
            return liquidity1
        } else if (currentSqrtPrice < sqrtPriceMax) {
            return Math.min(liquidity0, liquidity1)
        }

        return liquidity0
    }

    getAmountsForLiquidity(
        liquidity,
        sqrtPriceMin,
        sqrtPriceMax,
        curSqrtPrice
    ) {
        const clampedPrice = Math.max(
            Math.min(curSqrtPrice, sqrtPriceMax),
            sqrtPriceMin
        )
        const tokenAamount = liquidity * (clampedPrice - sqrtPriceMin)
        const tokenBamount = liquidity * (1 / clampedPrice - 1 / sqrtPriceMax)

        return [tokenAamount, tokenBamount] // one can be zero if current price outside the range
    }

    dryBuy(amount, priceLimit = null) {
        this.dryState = {
            curPrice: this.curPrice,
            curLiq: this.curLiq,
            curRight: this.curRight,
            curLeft: this.curLeft,
            curPP: this.curPP,
            totalSold: this.totalSold,
            questLeftVolume: this.questLeftVolume,
            questRightVolume: this.questRightVolume
        }

        const [totalIn, totalOut] = this.buy(amount, priceLimit, true)

        for (const state in this.dryState) {
            this[state] = this.dryState[state]
        }

        this.dryState = {}

        return [totalIn, totalOut]
    }

    buy(amount, priceLimit = null, dry = false) {
        let totalAmountIn = 0,
            totalAmountOut = 0

        let nextPricePoint
        let nextPriceTarget

        let curLiq
        let arrivedAtSqrtPrice = Math.sqrt(this.curPrice)

        let journal = []
        let i = 0

        // while have stuff to sell, and not out of bounds and arrived at next price point to calculate next chunk of swap
        do {
            journal[i] = []

            nextPricePoint = this.curRight
            nextPriceTarget =
                priceLimit && pp2p(nextPricePoint) > priceLimit
                    ? priceLimit
                    : pp2p(nextPricePoint)

            // sets local variable from global variable (global changes on each cycle)
            curLiq = this.curLiq

            arrivedAtSqrtPrice += amount / curLiq

            journal[i].push(`POOL ${this.name}`)
            journal[i].push(`Op: buy ${i}`)
            journal[i].push(`Amount: ${amount}`)
            journal[i].push(`Current price point: ${this.curPP}`)
            journal[i].push(`Current price: ${this.curPrice}`)
            journal[i].push(`Current liquidity: ${curLiq}`)
            journal[i].push(
                `Current left/right: ${this.curLeft}/${this.curRight}`
            )
            journal[i].push('---')
            journal[i].push(
                `Next price point: log2(${nextPricePoint}) dec(${pp2p(
                    nextPricePoint
                )})`
            )
            journal[i].push(
                `Next price shift: ${nextPriceTarget} (${Math.sqrt(
                    nextPriceTarget
                )})`
            )
            journal[i].push(`Arrived price before cap: ${arrivedAtSqrtPrice}`)

            if (arrivedAtSqrtPrice > Math.sqrt(nextPriceTarget)) {
                arrivedAtSqrtPrice = Math.sqrt(nextPriceTarget)
            }

            journal[i].push(`Arrived price after cap: ${arrivedAtSqrtPrice}`)
            journal[i].push('---')

            if (
                Math.sqrt(nextPriceTarget) >= Math.sqrt(pp2p(nextPricePoint)) &&
                arrivedAtSqrtPrice >= Math.sqrt(nextPriceTarget)
            ) {
                journal[i].push(
                    `Arrived price is >= than ${
                        arrivedAtSqrtPrice >= Math.sqrt(nextPriceTarget)
                            ? 'nextPriceTarget'
                            : 'nextPricePoint'
                    }, capping at ${arrivedAtSqrtPrice}`
                )
                this.curLiq += this.pos.get(nextPricePoint).liquidity * 1
                this.curRight = this.pos.get(nextPricePoint).right
                this.curLeft = this.pos.get(nextPricePoint).left
                this.curPP = nextPricePoint
                journal[i].push(`Next liquidity: ${this.curLiq}`)
                journal[i].push(
                    `Next left/right: ${this.curLeft}/${this.curRight}`
                )
                journal[i].push('!!! ---')
                journal[i].push(`WILL MOVE TO POINT: ${nextPricePoint}`)
                journal[i].push('!!! ---')
            } else {
                journal[i].push('!!! ---')
                journal[i].push(`Staying with the same liquidity ${curLiq}`)
                journal[i].push('!!! ---')
            }

            journal[i].push(
                `Calculating Amount0: ${curLiq} * ${arrivedAtSqrtPrice} - ${Math.sqrt(
                    this.curPrice
                )}`
            )
            let amount0UntilNextPrice =
                curLiq * (arrivedAtSqrtPrice - Math.sqrt(this.curPrice))
            journal[i].push(
                `Calculating Amount1: ${curLiq} * 1/${arrivedAtSqrtPrice} - 1/${Math.sqrt(
                    this.curPrice
                )}`
            )
            journal[i].push('---')
            let amount1UntilNextPrice =
                curLiq * (1 / arrivedAtSqrtPrice - 1 / Math.sqrt(this.curPrice))

            journal[i].push(
                `Amount0 (curLiq * (arrived - sqrt(curPrice)):\n ${amount0UntilNextPrice}`
            )
            journal[i].push(
                `Amount1 (curLiq * (1/arrivedAtSqrtPrice - 1/sqrt(curPrice))):\n ${amount1UntilNextPrice}`
            )
            journal[i].push('---')
            this.curPrice = arrivedAtSqrtPrice ** 2
            this.questRightPrice = this.curPrice
            this.questLeftPrice = 1 / this.curPrice

            journal[i].push(
                `New price: ${this.curPrice} (${arrivedAtSqrtPrice})`
            )

            if (
                amount1UntilNextPrice === -Infinity ||
                isNaN(amount1UntilNextPrice)
            ) {
                i += 1
                continue
            }
            journal[i].push('---')
            amount += -amount0UntilNextPrice
            journal[i].push(
                `Remaining amount after paying ${amount0UntilNextPrice}: ${amount}`
            )

            totalAmountIn += -amount0UntilNextPrice
            totalAmountOut += Math.abs(amount1UntilNextPrice)

            i += 1
        } while (
            amount > 0 &&
            arrivedAtSqrtPrice === Math.sqrt(pp2p(nextPricePoint)) &&
            this.curRight < p2pp(TEMP_CONFIG.PRICE_MAX)
        )

        if (TEMP_CONFIG.JOURNAL && TEMP_CONFIG.JOURNAL_BUY) {
            journal.forEach((iteration) => {
                console.log(iteration.join('\n'))
            })
        }

        if (!dry) {
            this.totalSold += Math.abs(totalAmountOut)
            this.questLeftVolume += Math.abs(totalAmountIn)
            this.questRightVolume += -totalAmountOut
        }

        return [totalAmountIn, totalAmountOut]
    }

    // @TODO: Save pool state (all 5 variables) and if you cannot sell anything, restore state
    sell(amount, priceLimit = null, dry = false) {
        let totalAmountIn = 0,
            totalAmountOut = 0

        let nextPricePoint = this.curRight
        let nextPriceTarget
        let curLiq
        let arrivedAtSqrtPrice = Math.sqrt(2 ** this.curRight)

        let journal = []
        let i = 0

        while (
            amount > 0 &&
            arrivedAtSqrtPrice === Math.sqrt(pp2p(nextPricePoint)) &&
            this.curPP > p2pp(TEMP_CONFIG.PRICE_MIN)
        ) {
            journal[i] = []

            nextPricePoint = this.curPP
            nextPriceTarget =
                priceLimit && pp2p(nextPricePoint) < priceLimit
                    ? priceLimit
                    : pp2p(nextPricePoint)

            curLiq = this.curLiq

            arrivedAtSqrtPrice =
                curLiq / (amount + curLiq / Math.sqrt(this.curPrice))

            // arrived

            journal[i].push(`POOL ${this.name}`)
            journal[i].push(`Op (sell) ${i}`)
            journal[i].push(`Amount: ${amount}`)
            journal[i].push(
                `Bottom (current for buy) price point: ${this.curPP} (${pp2p(
                    this.curPP
                )})`
            )
            journal[i].push(
                `Current price: ${this.curPrice} (sqrt ${Math.sqrt(
                    this.curPrice
                )})`
            )
            journal[i].push(`Current liquidity: ${curLiq}`)
            journal[i].push(
                `Current left/right: ${this.curLeft} (${pp2p(this.curLeft)})/${
                    this.curRight
                } (${pp2p(this.curRight)})`
            )
            journal[i].push('---')
            journal[i].push(
                `Next price point: ${nextPricePoint} (${pp2p(nextPricePoint)})`
            )
            journal[i].push(`Next price shift: ${nextPriceTarget}`)
            journal[i].push('---')
            journal[i].push(
                `Arrived price before cap: ${arrivedAtSqrtPrice} (${
                    arrivedAtSqrtPrice ** 2
                })`
            )

            if (arrivedAtSqrtPrice < Math.sqrt(nextPriceTarget)) {
                arrivedAtSqrtPrice = Math.sqrt(nextPriceTarget)
            }

            journal[i].push(
                `Arrived price after cap: ${arrivedAtSqrtPrice} (${
                    arrivedAtSqrtPrice ** 2
                })`
            )
            journal[i].push('---')

            if (
                Math.sqrt(nextPriceTarget) <= Math.sqrt(pp2p(nextPricePoint)) &&
                arrivedAtSqrtPrice <= Math.sqrt(nextPriceTarget)
            ) {
                journal[i].push(
                    `Arrived price is <= than ${
                        arrivedAtSqrtPrice <= Math.sqrt(nextPriceTarget)
                            ? 'nextPriceTarget'
                            : 'nextPricePoint'
                    }, capping at ${arrivedAtSqrtPrice} (${
                        arrivedAtSqrtPrice ** 2
                    })`
                )

                const np = this.pos.get(nextPricePoint)
                journal[i].push(
                    `Next position: liq: ${np.liquidity} left: ${np.left} pp: ${np.pp} right: ${np.right}`
                )

                this.curLiq -= this.pos.get(this.curPP).liquidity

                if (this.curLiq / 0.000001 < 0) {
                    this.curLiq = 0
                }

                this.curRight = this.curPP
                this.curPP = this.pos.get(this.curPP).left
                this.curLeft = this.pos.get(this.curPP).left // using updated curPP

                journal[i].push(`Next liquidity: ${this.curLiq}`)
                journal[i].push(
                    `Next left/right: ${this.curLeft} (${pp2p(this.curLeft)})/${
                        this.curRight
                    } (${pp2p(this.curRight)})`
                )
                journal[i].push('!!! ---')
                journal[i].push(`WILL MOVE TO NEXT POSITION: ${nextPricePoint}`)
                journal[i].push('!!! ---')
            }

            journal[i].push(
                `Calculating amount0: ${curLiq} * (1 / ${Math.sqrt(
                    this.curPrice
                )} - (1 / ${arrivedAtSqrtPrice})`
            )
            let amount0UntilNextPrice =
                curLiq * (1 / Math.sqrt(this.curPrice) - 1 / arrivedAtSqrtPrice)

            journal[i].push(
                `Calculating amount1: ${curLiq} * (${Math.sqrt(
                    this.curPrice
                )} - ${arrivedAtSqrtPrice})`
            )
            let amount1UntilNextPrice =
                curLiq * (Math.sqrt(this.curPrice) - arrivedAtSqrtPrice)
            journal[i].push('---')

            journal[i].push(
                `Amount0 (curLiq * (1 / sqrt(curPrice) - (1 / arrivedAt)): ${amount0UntilNextPrice}`
            )
            journal[i].push(
                `Amount1 (curLiq * (sqrt(curPrice) - arrivedAt)): ${amount1UntilNextPrice}`
            )
            journal[i].push('---')

            this.curPrice = arrivedAtSqrtPrice ** 2
            this.questRightPrice = this.curPrice
            this.questLeftPrice = 1 / this.curPrice

            journal[i].push(
                `New price: ${this.curPrice} (${Math.sqrt(arrivedAtSqrtPrice)})`
            )

            journal[i].push('---')
            amount += amount0UntilNextPrice
            journal[i].push(
                `Remaining amount after subtracting ${amount0UntilNextPrice}: ${amount}`
            )

            totalAmountOut += Math.abs(amount1UntilNextPrice)
            totalAmountIn += amount0UntilNextPrice

            journal[i].push(
                `Total in ${totalAmountIn} / total out ${totalAmountOut}`
            )

            journal[i].push(`Total sold ${this.totalSold}`)

            i += 1
        }

        if (TEMP_CONFIG.JOURNAL && TEMP_CONFIG.JOURNAL_SELL) {
            journal.forEach((iteration) => {
                console.log(iteration.join('\n'))
            })
        }

        if (!dry) {
            this.totalSold += totalAmountIn
            this.questRightVolume += Math.abs(totalAmountIn)
            this.questLeftVolume += -totalAmountOut
            if (this.questLeftVolume < 0) {
                this.questLeftVolume = 0
            }
            if (this.totalSold < 0) {
                this.totalSold = 0
            }
        }

        return [totalAmountIn, totalAmountOut]
    }

    drySell(amount, priceLimit = null) {
        this.dryState = this.getPoolState()

        const [totalIn, totalOut] = this.sell(amount, priceLimit, true)

        for (const state in this.dryState) {
            this[state] = this.dryState[state]
        }

        this.dryState = {}

        return [totalIn, totalOut]
    }

    swap(amount, zeroForOne) {
        return zeroForOne ? this.buy(amount) : this.sell(amount)
    }

    /**
     *
     * @param {number} amount
     * @param {boolean} zeroForOne
     * @returns
     */
    drySwap(amount, zeroForOne) {
        return zeroForOne ? this.dryBuy(amount) : this.drySell(amount)
    }

    getPoolState(): IPoolState {
        return {
            curPrice: this.curPrice,
            curLiq: this.curLiq,
            curRight: this.curRight,
            curLeft: this.curLeft,
            curPP: this.curPP,
            questLeftPrice: this.questLeftPrice,
            questRightPrice: this.questRightPrice,
            questLeftVolume: this.questLeftVolume,
            questRightVolume: this.questRightVolume
        }
    }

    getType() {
        return this.type
    }

    isQuest() {
        return this.type === 'quest'
    }

    getSwapInfo(logOut = false) {
        const leftBalance = this.dryBuy(100000000000)
        const rightBalance = this.drySell(100000000000)

        if (logOut) {
            console.log(`Pool: (cited/USDC)${this.name}(citing)
            buy(amt): ${this.tokenLeft} in (deduct from amt), ${
                this.tokenRight
            } out (add to balance)
            sell(amt): ${this.tokenRight} in (deduct from amt), ${
                this.tokenLeft
            } out (add to balance)
            --
            total ${this.tokenLeft}: ${
                rightBalance[1] > 0 ? rightBalance[1] : 0
            }
            total ${this.tokenRight}: ${leftBalance[1] > 0 ? leftBalance[1] : 0}
            ---
            can buy(take in) ${Math.abs(leftBalance[0])} ${
                this.tokenLeft
            } for(give out) ${Math.abs(leftBalance[1])} ${this.tokenRight}
            can sell(give) ${Math.abs(rightBalance[1])} ${
                this.tokenLeft
            } for(take) ${Math.abs(rightBalance[0])} ${this.tokenRight}`)
        }

        return [leftBalance, rightBalance]
    }

    getTVL() {
        return Math.round(this.totalSold * this.curPrice)
    }

    getMarketCap() {
        if (!this.isQuest()) {
            return
        }

        const totalTokens = this.posOwners.reduce(
            (acc, val) => acc + val.amt1,
            0
        )

        return Math.round(totalTokens * this.curPrice)
    }

    getUSDCValue() {
        return this.isQuest() ? this.questLeftVolume : 0
    }

    getDecPos() {
        return this.pos
            .values()
            .sort((s, a) => s.pp - a.pp)
            .map((p) => ({
                left: pp2p(p.left),
                pp: pp2p(p.pp),
                right: pp2p(p.left),
                liq: p.liquidity
            }))
    }
}
