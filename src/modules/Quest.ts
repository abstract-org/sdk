import sha256 from 'crypto-js/sha256'
import Hex from 'crypto-js/enc-hex'
import HashMap from 'hashmap'

import { Pool } from './Pool'
import { UsdcToken } from './UsdcToken'
import { IQuest } from '../interfaces'

export const TEMP_CONFIG = {
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
    created_at: string
    published_at: string

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
        createdAt?: string
    ): Quest {
        const hash = Quest.makeHash({ name, kind, content })
        const thisToken = new Quest()
        thisToken.hash = hash
        thisToken.name = name || `_${kind.toUpperCase()}${hash.substring(0, 4)}`
        thisToken.kind = kind
        thisToken.content = content
        thisToken.creator_hash = creatorHash
        thisToken.created_at = createdAt

        return thisToken
    }

    static makeHash({
        name,
        kind,
        content
    }: {
        name?: string
        kind?: string
        content?: string
    }) {
        if (kind && content) {
            return Hex.stringify(sha256(`${kind}${content}`))
        } else if (name) {
            return Hex.stringify(sha256(name))
        } else {
            throw new Error(
                `Couldn't generate hash. Provide kind and content, or name`
            )
        }
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
