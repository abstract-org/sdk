import { IPool } from './IPool'

type IWalletBalance = {
    [key: string]: number
}

export interface IWalletQueryUpdate {
    name?: string
    hash?: string
}

export interface IWalletCreate {
    name: string
    hash: string
}

export interface IWallet {
    id?: number
    name: string
    hash: string
    balances: IWalletBalance
    addBalance(questName: string, balanceChange: number): void
    citeQuest(
        crossPool: IPool,
        priceMin: number,
        priceMax: number,
        token0Amt: number,
        token1Amt: number,
        native: boolean
    ): [number, number]
}
