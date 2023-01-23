export interface IWalletQueryUpdate {
    name?: string;
    hash?: string;
}

export interface IWalletCreate {
    name: string;
    hash: string;
}

export interface IWallet {
    name: string;
    hash: string;
    balances: Array<any>
}