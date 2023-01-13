import { IDataStoreRepository } from '../interfaces/IDataStoreRepository'
import { IPool, IQuest, IWallet } from '../interfaces'
import { Service } from 'typedi'

@Service()
export class SupabaseRepository implements IDataStoreRepository {
    createPool(data: IPool): Promise<IPool> {
        throw new Error('Not implemented')
    }

    updatePool(id: number, data: IPool): Promise<IPool> {
        throw new Error('Not implemented')
    }

    findPoolByFilter(filter: string): Promise<IPool> {
        throw new Error('Not implemented')
    }

    createQuest(data: IQuest): Promise<IQuest> {
        throw new Error('Not implemented')
    }

    updateQuest(id: number, data: IQuest): Promise<IQuest> {
        throw new Error('Not implemented')
    }

    findQuestByFilter(filter: string): Promise<IQuest> {
        throw new Error('Not implemented')
    }

    findWalletByFilter(filter: string): Promise<IWallet> {
        throw new Error('Not implemented')
    }

    createWallet(data: IWallet): Promise<IWallet> {
        throw new Error('Not implemented')
    }

    updateWallet(id: number, data: IWallet): Promise<IWallet> {
        throw new Error('Not implemented')
    }
}