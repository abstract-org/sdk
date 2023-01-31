import { IWallet, IWalletCreate, IWalletQueryUpdate } from './IWallet'
import { IBalance } from './IBalance'

export interface IWalletPersistance {
    getWallets(walletHashes: Array<string>): Promise<Array<IWallet>>

    getWalletsWithQuests(questHashes: Array<string>, limit: number): Promise<Array<IWallet>>

    saveWallet(data: IWalletCreate): Promise<IWallet>

    updateWallet(questId: number, data: IWalletQueryUpdate): Promise<IWallet>

    addBalance(walletHash: string, questHash: string, balance: number): Promise<IBalance>

    getBalances(walletHash: string): Promise<Array<IBalance>>
}