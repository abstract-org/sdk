import {
    IDataStoreRepository,
    IWallet,
    IWalletCreate,
    IWalletPersistance,
    IWalletQueryUpdate,
    IBalance,
    IBalanceCreate, IBalanceQueryUpdate
} from '../interfaces'
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

    async getBalances(walletHash: string): Promise<Array<IBalance>> {
        const filters: QueryFilterType = [{ propertyName: 'walletHash', filterType: 'eq', value: walletHash }]

        return await this.dataStoreRepository.find<IBalance>('balances', filters)
    }

    async addBalance(walletHash: string, questHash: string, balance: number): Promise<IBalance> {
        const filters: QueryFilterType = [{
            propertyName: 'walletHash',
            filterType: 'eq',
            value: walletHash
        }, { propertyName: 'questHash', filterType: 'eq', value: questHash }]

        const existingBalance = await this.dataStoreRepository.find<IBalance>('balances', filters)

        if (existingBalance.length) {
            return await this.dataStoreRepository.update<IBalance, IBalanceQueryUpdate>('balances', { balance: balance }, filters)
        }

        return await this.dataStoreRepository.create<IBalance, IBalanceCreate>('balances', {
            walletHash,
            questHash,
            balance
        })
    }
}