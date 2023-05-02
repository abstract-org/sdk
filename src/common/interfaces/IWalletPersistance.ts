import { IWallet, IWalletCreate, IWalletQueryUpdate } from './IWallet'

export interface IWalletPersistance {
    getWallets(walletHashes: Array<string>): Promise<Array<IWallet>>

    getWalletsWithQuests(
        questHashes: Array<string>,
        limit: number
    ): Promise<Array<IWallet>>

    saveWallet(data: IWalletCreate): Promise<IWallet>

    updateWallet(questHash: string, data: IWalletQueryUpdate): Promise<IWallet>
}
