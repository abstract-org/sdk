import {
    IQuest,
    IPool,
    IWallet,
    IWalletCreate,
    IWalletQueryUpdate,
    IQuestCreate,
    IQuestUpdate,
    IPoolCreate,
    IPoolQueryUpdate,
    PoolStatePopulated
} from './index'
import { QueryFilterType } from '../types'

export interface IQueryOptions {
    limit?: number
}

export interface IDataStoreRepository {
    findPoolByFilter(
        filters: QueryFilterType,
        options?: IQueryOptions
    ): Promise<Array<IPool>>

    createPool(data: IPoolCreate): Promise<IPool>

    updatePool(hash: string, data: IPoolQueryUpdate): Promise<IPool>

    findWalletByFilter(
        filter: QueryFilterType,
        options?: IQueryOptions
    ): Promise<Array<IWallet>>

    createWallet(data: IWalletCreate): Promise<IWallet>

    updateWallet(hash: string, data: IWalletQueryUpdate): Promise<IWallet>

    findQuestsByFilter(
        filter: QueryFilterType,
        options?: IQueryOptions
    ): Promise<Array<IQuest>>

    createQuest(data: IQuestCreate): Promise<IQuest>

    updateQuest(hash: string, data: Partial<IQuestUpdate>): Promise<IQuest>

    createPoolState(data: PoolStatePopulated): Promise<PoolStatePopulated>
}
