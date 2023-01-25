import { IPoolPersistence, IDataStoreRepository, IPool } from '../interfaces'
import { QueryFilterType } from '../types'

export class PoolPersistenceService implements IPoolPersistence {
    constructor(private dataStoreRepository: IDataStoreRepository) {
    }

    async getPools(poolHashes: Array<string>): Promise<Array<IPool>> {
        const filters: QueryFilterType = [{ filterType: 'in', propertyName: 'hash', value: poolHashes }]

        return await this.dataStoreRepository.findPoolByFilter(filters)
    }

    async getPoolsByKind(kind: string, limit: number): Promise<Array<IPool>> {
        const filters: QueryFilterType = [{ filterType: 'eq', propertyName: 'kind', value: kind }]

        return await this.dataStoreRepository.findPoolByFilter(filters)
    }

    getPoolsByPriceRange(priceMin: number, priceMax: number, limit: number): Promise<IPool> {
        throw new Error('Not implemented')
    }

    getPoolsByCitationsCount(citationCount: number, limit: number): Promise<Array<IPool>> {
        throw new Error('Not implemented')
    }

    async savePool(data: IPool): Promise<IPool> {
        return await this.dataStoreRepository.createPool(data)
    }

    async updatePool(poolId: number, data: IPool): Promise<IPool> {
        return await this.dataStoreRepository.updatePool(poolId, data)
    }
}