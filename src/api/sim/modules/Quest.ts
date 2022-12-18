import sha256 from 'crypto-js/sha256'
import HashMap from 'hashmap'

import Pool from './Pool'
import { pp2p } from '../../../utils/logicUtils'
import globalConfig from '../config.global.json'
// make it a hash map
import UsdcToken from './UsdcToken'

export default class Token {
    id // make uuid
    hash
    name
    pools = []
    initialBalanceA = 0
    initialBalanceB = 0
    positions = new HashMap()

    /**
     * @description Instantiates new Token with name
     * @param {string} name
     * @returns {Token}
     */
    static create(name) {
        const thisToken = new Token()
        thisToken.name = name
        thisToken.hash = '0x' + sha256(name)

        return thisToken
    }

    createPool({
                   tokenLeft = null,
                   startingPrice = null,
                   initialPositions = null
               } = {}) {
        const tokenLeftInstance = tokenLeft || new UsdcToken()
        const pool = Pool.create(tokenLeftInstance, this, startingPrice)

        this.addPool(pool)
        tokenLeftInstance.addPool(pool)

        this.initializePoolPositions(pool, initialPositions)

        return pool
    }

    /**
     * @param {Object} pool
     */
    addPool(pool) {
        if (
            this.pools.find(
                (existingPoolName) => existingPoolName === pool.name
            )
        )
            return

        this.pools.push(pool.name)
    }

    initializePoolPositions(pool, initialPositions) {
        const initial = initialPositions || globalConfig.INITIAL_LIQUIDITY
        initial.forEach((position) => {
            pool.openPosition(
                position.priceMin,
                position.priceMax,
                position.tokenA,
                position.tokenB
            )

            this.initialBalanceA += parseFloat(position.tokenA)
            this.initialBalanceB += parseFloat(position.tokenB)

            pool.posOwners.push({
                hash: this.hash,
                pmin: position.priceMin,
                pmax: position.priceMax,
                amt0: position.tokenA,
                amt1: position.tokenB,
                type: 'token'
            })
        })

        this.positions.set(pool.name, pool.pos.values())
    }

    // @TODO: Token can open positions during dampening (?)
}