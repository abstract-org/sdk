import sha256 from 'crypto-js/sha256'
import Hex from 'crypto-js/enc-hex'
import HashMap from 'hashmap'

import { Pool } from './Pool'
import { UsdcToken } from './UsdcToken'
import { IQuest } from '../interfaces'

const TEMP_CONFIG = {
    INITIAL_LIQUIDITY: [
        {
            priceMin: 1,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        },
        {
            priceMin: 20,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        },
        {
            priceMin: 50,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        },
        {
            priceMin: 200,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        }
    ]
}

export class Quest {
    id
    hash
    name
    pools = []
    positions = new HashMap()
    kind: string
    content: string
    creator_hash: string
    created_at: number
    published_at: number

    /**
     * @description Instantiates new Quest
     * @param {string} name
     * @param {string} kind
     * @param {string} content
     * @returns {Token}
     */
    static create(
        name: string,
        kind?: string,
        content?: string,
        creatorHash?: string,
        createdAt?: number
    ): IQuest {
        const thisToken = new Quest()
        thisToken.name = name
        thisToken.hash = Hex.stringify(sha256(name))
        thisToken.kind = kind
        thisToken.content = content
        thisToken.creator_hash = creatorHash
        thisToken.created_at = createdAt

        return thisToken
    }

    /**
     * @description Instantiates new Quest and hydrates it with DTO
     */
    static instantiate(questDto: IQuest): Quest {
        const quest = new Quest()
        quest.id = questDto.id
        quest.hash = questDto.hash
        quest.kind = questDto.kind
        quest.content = questDto.content
        quest.creator_hash = questDto.creator_hash
        quest.name = questDto.hash
        quest.pools = questDto.pools

        return quest
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

        if (initialPositions) {
            this.initializePoolPositions(pool, initialPositions)
        }

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
        const initial = initialPositions || TEMP_CONFIG.INITIAL_LIQUIDITY
        initial.forEach((position) => {
            pool.openPosition(
                position.priceMin,
                position.priceMax,
                position.tokenA,
                position.tokenB
            )
        })

        this.positions.set(pool.name, pool.pos.values())
    }

    // @TODO: Token can open positions during dampening (?)
}
