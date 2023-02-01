export interface IBalanceCreate {
    walletHash: string;
    questHash: string;
    balance: number
}

export interface IBalance {
    walletHash: string;
    questHash: string;
    balance: number;
}

export interface IBalanceQueryUpdate {
    walletHash?: string;
    questHash?: string;
    balance?: number;
}