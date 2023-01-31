import {
    IPool,
    IQuest,
    IWallet,
    IDataStoreRepository,
    IQuestCreate,
    IQueryOptions,
    IPoolCreate,
    IPoolQueryUpdate
} from '../interfaces'
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { QueryFilterType } from '../types'
import { ConstructorSimConfig } from '../api/sim/SimAPI'

type TableNameType = 'pools' | 'quests' | 'wallets'

export class SupabaseRepository implements IDataStoreRepository {
    client: SupabaseClient

    constructor(config: ConstructorSimConfig) {
        this.client = createClient(config.dbUrl, config.accessToken)
    }

    async createPool(data: IPoolCreate): Promise<IPool> {
        return await this.create<IPool, IPoolCreate>('pools', data)
    }

    async updatePool(id: number, data: IPoolQueryUpdate): Promise<IPool> {
        return await this.update<IPool, IPoolQueryUpdate>('pools', data, [
            {
                filterType: 'eq',
                propertyName: 'id',
                value: id
            }
        ])
    }

    async findPoolByFilter(filters: QueryFilterType): Promise<Array<IPool>> {
        return await this.find<IPool>('pools', filters)
    }

    async createQuest(data: IQuestCreate): Promise<IQuest> {
        return this.create('quests', data)
    }

    updateQuest(id: number, data: Partial<IQuestCreate>): Promise<IQuest> {
        throw new Error('Not implemented')
    }

    findQuestsByFilter(
        filter: QueryFilterType,
        options?: IQueryOptions
    ): Promise<IQuest[]> {
        throw new Error('Not implemented')
    }

    findWalletByFilter(filters: QueryFilterType): Promise<Array<IWallet>> {
        throw new Error('Not implemented')
    }

    createWallet(data: IWallet): Promise<IWallet> {
        throw new Error('Not implemented')
    }

    updateWallet(id: number, data: IWallet): Promise<IWallet> {
        throw new Error('Not implemented')
    }

    async create<T, R>(tableName: TableNameType, data: R): Promise<T> {
        try {
            return (await this.client
                .from(tableName)
                .insert(data)
                .select('*')) as T
        } catch (e) {
            console.error(
                `[SupabaseRepository] create for table ${tableName} has failed with error ${e.message}`
            )
        }
    }

    async update<T, R>(
        tableName: TableNameType,
        data: R,
        filters: QueryFilterType
    ): Promise<T> {
        try {
            let query = this.client.from(tableName).update(data)

            query = this.applyFiltersToQuery(query, filters)

            query.select()

            return (await query) as T
        } catch (e) {
            console.error(
                `[SupabaseRepository] update for table ${tableName} has failed with error ${e.message}`
            )
        }
    }

    async find<T>(
        tableName: TableNameType,
        filters: QueryFilterType
    ): Promise<Array<T>> {
        try {
            let query = this.client.from(tableName).select()

            query = this.applyFiltersToQuery(query, filters)

            const response = await query

            return response.data
        } catch (e) {
            console.error(
                `[SupabaseRepository] find for table ${tableName} has failed with error ${e.message}`
            )
        }
    }

    private applyFiltersToQuery(
        query: PostgrestFilterBuilder<any, any, any>,
        filters: QueryFilterType
    ) {
        filters.forEach((filter) => {
            query[filter.filterType](filter.propertyName, filter.value)
        })

        return query
    }
}
