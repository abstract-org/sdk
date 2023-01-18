import { IPoolPersistence, IDataStoreRepository, IPool } from '../interfaces'
import { QueryFilterType } from '../types'

export class PoolPersistenceService implements IPoolPersistence {
    constructor(private dataStoreRepository: IDataStoreRepository) {
    }

    async getPools(poolHashes: Array<string>): Promise<Array<IPool>> {
        const filters: QueryFilterType = [{ filterType: 'in', propertyName: 'hash', value: poolHashes }]

        return await this.dataStoreRepository.findPoolByFilter(filters)
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