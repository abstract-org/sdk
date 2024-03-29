import { IDataStoreRepository, IWallet, IWalletCreate, IWalletPersistance, IWalletQueryUpdate } from '../interfaces'
import { QueryFilterType } from '../types'

export class WalletPersistenceService implements IWalletPersistance {
    constructor(private dataStoreRepository: IDataStoreRepository) {
    }

    async getWallets(walletHashes: Array<string>): Promise<Array<IWallet>> {
        const filters: QueryFilterType = [{ filterType: 'in', propertyName: 'hash', value: walletHashes }]

        return await this.dataStoreRepository.findWalletByFilter(filters)
    }

    getWalletsWithQuests(questHashes: Array<string>, limit: number): Promise<Array<IWallet>> {
        throw new Error('Not implemented')
    }

    async saveWallet(data: IWalletCreate): Promise<IWallet> {
        return await this.dataStoreRepository.createWallet(data)
    }

    async updateWallet(questId: number, data: IWalletQueryUpdate): Promise<IWallet> {
        return await this.dataStoreRepository.updateWallet(questId, data)
    }
}