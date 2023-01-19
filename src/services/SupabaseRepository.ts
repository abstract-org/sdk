import {
    IPool,
    IQuest,
    IWallet,
    IDataStoreRepository,
    IQueryFilter,
    QuestDto,
    IQueryOptions
} from '../interfaces'
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { QueryFilterType } from '../types'
import { ConstructorSimConfig } from '../api/sim/SimAPI'

type TableNameType = 'pools' | 'quests' | 'wallets'

export class SupabaseRepository implements IDataStoreRepository {
    client: SupabaseClient

    constructor(config: ConstructorSimConfig) {
        this.client = createClient(
            config.dbUrl,
            config.accessToken
        )
    }

    async createPool(data: IPool): Promise<IPool> {
        return await this.create('pools', data)
    }

    async updatePool(id: number, data: IPool): Promise<IPool> {
        return await this.update('pools', data, [{ filterType: 'eq', propertyName: 'id', value: id }])
    }

    async findPoolByFilter(filters: QueryFilterType): Promise<Array<IPool>> {
        return await this.find('pools', filters)
    }

    async createQuest(data: IQuest): Promise<IQuest> {
        try {
            const resp = await this.client
                .from('quests')
                .insert({
                    hash: data.hash,
                    kind: data.kind
                })
                .select('*')
                .maybeSingle()

            return resp.data
        } catch (err) {
            return null
        }
    }

    updateQuest(id: number, data: IQuest): Promise<IQuest> {
        throw new Error('Not implemented')
    }

    findQuestsByFilter(
        filter: IQueryFilter,
        options?: IQueryOptions
    ): Promise<QuestDto[]> {
        throw new Error('Not implemented')
    }

    findWalletByFilter(filter: IQueryFilter): Promise<IWallet> {
        throw new Error('Not implemented')
    }

    createWallet(data: IWallet): Promise<IWallet> {
        throw new Error('Not implemented')
    }

    updateWallet(id: number, data: IWallet): Promise<IWallet> {
        throw new Error('Not implemented')
    }

    private async create(tableName: TableNameType, data: IPool | IQuest | IWallet): Promise<IPool | IQuest | IWallet> {
        try {
            return this.client
                .from(tableName)
                .insert(data)
                .select('*')
        } catch (e) {
            console.error(`[SupabaseRepository] create for table ${tableName} has failed with error ${e.message}`)
        }
    }

    private async update(tableName: TableNameType, data: IPool | IQuest | IWallet, filters: QueryFilterType): Promise<IPool | IQuest | IWallet> {
        try {
            let query = this.client
                .from(tableName)
                .update(data)

            query = this.applyFiltersToQuery(query, filters)

            query.select()

            return await query
        } catch (e) {
            console.error(`[SupabaseRepository] update for table ${tableName} has failed with error ${e.message}`)
        }
    }

    private async find(tableName: TableNameType, filters: QueryFilterType): Promise<Array<IPool | IQuest | IWallet>> {
        try {
            let query = this.client.from(tableName).select()

            query = this.applyFiltersToQuery(query, filters)

            const response = await query

            return response.data
        } catch (e) {
            console.error(`[SupabaseRepository] find for table ${tableName} has failed with error ${e.message}`)
        }
    }

    private applyFiltersToQuery(query: PostgrestFilterBuilder<any, any, any>, filters: QueryFilterType) {
        filters.forEach(filter => {
            query[filter.filterType](filter.propertyName, filter.value)
        })

        return query
    }
}
