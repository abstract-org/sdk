export interface IBalanceCreate {
    walletHash: string;
    questHash: string;
    balance: number
}

export interface IBalance {
    questHash: string;
    balance: number;
}