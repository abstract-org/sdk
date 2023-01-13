import { IPool } from './IPool'

export interface IPoolPersistance {
    getPools(poolHashes: Array<string>): Promise<Array<IPool>>

    getPoolsByKind(kind: string, limit: number): Promise<Array<IPool>>

    getPoolsByCitationsCount(citationCount: number, limit: number): Promise<Array<IPool>>

    getPoolsByPriceRange(priceMin: number, priceMax: number, limit: number): Promise<IPool>

    savePool(data: IPool): Promise<IPool>

    updatePool(questId: number, data: IPool): Promise<IPool>
}