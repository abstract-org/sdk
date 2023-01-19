import { IQuest, IPool, IWallet } from './index'
import { QueryFilterType } from '../types'

export interface IDataStoreRepository {
    findPoolByFilter(filters: QueryFilterType): Promise<Array<IPool>>

    createPool(data: IPool): Promise<IPool>

    updatePool(id: number, data: IPool): Promise<IPool>

    findWalletByFilter(filters: QueryFilterType): Promise<Array<IWallet>>

    createWallet(data: IWallet): Promise<IWallet>

    updateWallet(id: number, data: IWallet): Promise<IWallet>

    findQuestByFilter(filter: string): Promise<IQuest>

    createQuest(data: IQuest): Promise<IQuest>

    updateQuest(id: number, data: IQuest): Promise<IQuest>
}