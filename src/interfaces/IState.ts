import HashMap from 'hashmap'
import { Wallet, Pool, Quest } from '../modules'

export declare type TQuestName = string
export declare type TPoolName = string
export declare type TWalletHash = string

// @deprecated
export interface IState {
    wallets: HashMap<TWalletHash, Wallet>
    pools: HashMap<TPoolName, Pool>
    quests: HashMap<TQuestName, Quest>
    walletStore: {
        wallets: TWalletHash[]
    }
    poolStore: {
        pools: Array<TPoolName>
        swaps: []
        active: TPoolName
        swapMode: string
    }
    questStore: {
        quests: Array<TQuestName>
        humanQuests: Array<TQuestName>
        selectedQuests: Array<TQuestName>
        active: TQuestName
        proMode: boolean
    }
    generatorStore: { questConfigs: any[]; invConfigs: any[] }
    logStore: { logObjs: any[] }
    dayTrackerStore: {
        currentDay: number
    }
    historical: {
        walletNavs: object
        walletBalances: object
    }
    moneyDist: {
        citing: Array<any>
        buying: Array<any>
        selling: Array<any>
        buyingSmart: Array<any>
        sellingSmart: Array<any>
    }
}
