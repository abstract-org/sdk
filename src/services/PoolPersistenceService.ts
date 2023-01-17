import { IPoolPersistance, IDataStoreRepository, IPool } from '../interfaces'

export class PoolPersistenceService implements IPoolPersistance {
    constructor(private dataStoreRepository: IDataStoreRepository) {
    }

    async getPools(poolHashes: Array<string>): Promise<Array<IPool>> {
        throw new Error('Not implemented')
    }

    getPoolsByKind(kind: string, limit: number): Promise<Array<IPool>> {
        throw new Error('Not implemented')
    }

    getPoolsByPriceRange(priceMin: number, priceMax: number, limit: number): Promise<IPool> {
        throw new Error('Not implemented')
    }

    getPoolsByCitationsCount(citationCount: number, limit: number): Promise<Array<IPool>> {
        throw new Error('Not implemented')
    }

    savePool(data: IPool): Promise<IPool> {
        throw new Error('Not implemented')
    }

    updatePool(questId: number, data: IPool): Promise<IPool> {
        throw new Error('Not implemented')
    }
}