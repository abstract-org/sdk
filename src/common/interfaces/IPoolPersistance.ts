import { IPool, IPoolCreate, IPoolQueryUpdate } from './IPool'
import { PoolType } from '../types'
import { PoolStatePopulated } from './IPoolState'

export interface IPoolPersistence {
    getPools(poolHashes: Array<string>): Promise<Array<IPool>>

    getPoolsByKind(kind: string, limit: number): Promise<Array<IPool>>

    getPoolsByType(type: PoolType, limit: number): Promise<Array<IPool>>

    getPoolsByCitationsCount(
        citationCount: number,
        limit: number
    ): Promise<Array<IPool>>

    getPoolsByPriceRange(
        priceMin: number,
        priceMax: number,
        limit: number
    ): Promise<IPool>

    savePool(data: IPoolCreate): Promise<IPool>

    updatePool(questId: number, data: IPoolQueryUpdate): Promise<IPool>

    createPoolState(data: PoolStatePopulated): Promise<PoolStatePopulated>
}
