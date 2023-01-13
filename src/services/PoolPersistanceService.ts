import { Service } from 'typedi'
import { SupabaseRepository } from './SupabaseRepository'
import { IPoolPersistance } from '../interfaces/IPoolPersistance'
import { IPool } from '../interfaces'

@Service()
export class PoolPersistanceService implements IPoolPersistance {
    constructor(private dataStoreRepository: SupabaseRepository) {
    }

    getPools(poolHashes: Array<string>): Promise<Array<IPool>> {
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