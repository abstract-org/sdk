import { IQuest, IPool, IWallet } from './index'

export interface IDataStoreRepository {
    findPoolByFilter(filter: string): Promise<IPool>

    createPool(data: IPool): Promise<IPool>

    updatePool(id: number, data: IPool): Promise<IPool>

    findWalletByFilter(filter: string): Promise<IWallet>

    createWallet(data: IWallet): Promise<IWallet>

    updateWallet(id: number, data: IWallet): Promise<IWallet>

    findQuestByFilter(filter: string): Promise<IQuest>

    createQuest(data: IQuest): Promise<IQuest>

    updateQuest(id: number, data: IQuest): Promise<IQuest>
}