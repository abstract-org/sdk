import { IWallet } from './IWallet'

export interface IWalletPersistance {
    getWallets(walletHashes: Array<string>): Promise<Array<IWallet>>

    getWalletsWithQuests(questHashes: Array<string>, limit: number): Promise<Array<IWallet>>

    saveWallet(data: IWallet): Promise<IWallet>

    updateWallet(questId: number, data: IWallet): Promise<IWallet>
}