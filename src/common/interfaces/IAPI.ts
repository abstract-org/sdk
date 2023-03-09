import { Wallet, Pool, Quest } from '../modules'
import HashMap from 'hashmap'

import {
    ILog,
    IPool,
    IPosition,
    IQuest,
    ISnapshot,
    IState,
    ISwap,
    ITotalsList
} from './index'

// @deprecated
export interface IAPI {
    // Snapshot API
    getSnapshotById?(snapshotId: number): ISnapshot

    // Pool API
    createPool(name: string, description: string): boolean
    getPoolsBySnapshot?(snapshotId: number, day?: number): Array<IPool>
    getPoolsByQuests?(questIds: Array<number>): Array<IPool>
    getPoolsByPath?(path: string): Array<IPool>
    updatePool?(): void

    // Quests API
    createQuest(name: string, description: string): boolean
    citeQuest(questId: number, userId: string): boolean
    getQuestsBySnapshot?(snapshotId: number, day?: number): Array<IQuest>
    getQuestDependants?(questId: number): Array<IQuest>
    getQuestDependencies?(questId: number): Array<IQuest>
    getQuestsByPath?(path: string): Array<IQuest>
    updateQuest?(): void

    // Swaps API
    getSwaps?(): Array<ISwap>
    updateSwaps?(): void

    // Logs API
    getLogsBySnapshot?(snapshotId: number, day?: number): Array<ILog>
    getLogsByQuest?(questId: number): Array<ILog>
    getLogsByPool?(poolId: number): Array<ILog>
    getLogsInDayRange?(dayFrom: number, dayTo: number): Array<ILog>

    // Wallet API
    openPosition?(poolId: number, position: IPosition): void
    updateWalletBalances?(): void
    updateWalletNavs?(config: {
        walletId: number
        day: number
        usdcNav: number
        tokenNav: number
    }): void
    createWallet?(
        type: string,
        name: string,
        initialBalance: number,
        isDefault?: boolean
    ): Wallet

    // Supabase API

    saveQuests?(
        quests: Array<Quest>,
        humanQuests: Array<string> | null,
        questNamesToWalletIds: HashMap<string, number>,
        snapshotId: number
    ): Promise<HashMap<string, number>>

    saveWallets?(
        wallets: Array<Wallet>,
        snapshotId: number
    ): Promise<HashMap<string, number>>

    savePools?(
        pools: Array<Pool>,
        questNameToQuestId: HashMap<string, number>,
        snapshotId: number
    ): Promise<HashMap<string, number>>

    createSnapshotDataRelation?(
        relationType,
        snapshotId: number,
        entities: Array<{ id: number; name: string }>
    ): Promise<void>

    saveScenario?(
        scenarioName: string,
        walletConfigs: Record<string, any>,
        questConfigs: Record<string, any>
    ): Promise<number>

    saveSwaps?(
        swapsArray: object[],
        poolMappings: HashMap<string, number>,
        walletMappings: HashMap<string, number>
    ): Promise<void>

    saveLogs?(
        logsArray: object[],
        poolMappings: HashMap<string, number>,
        walletMappings: HashMap<string, number>
    ): Promise<void>

    savePositionsData?(
        pools: Pool[],
        poolMappings: HashMap<string, number>,
        walletMappings: HashMap<string, number>
    ): Promise<boolean>

    saveWalletBalances?(
        walletBalancesByDay: Array<[number, Record<string, object[]>]>,
        walletHashToWalletId: HashMap<string, number>,
        questNameToQuestId: HashMap<string, number>
    ): Promise<void>

    saveWalletNavs?(
        walletNavsByDay: Array<[number, Record<string, number>]>,
        walletHashToWalletId: HashMap<string, number>
    ): Promise<void>

    saveSnapshotTotals?(
        snapshotId: number,
        {
            quests,
            pools,
            wallets
        }: { quests: Quest[]; pools: Pool[]; wallets: Wallet[] }
    ): Promise<any>

    saveSnapshot?({
        scenarioId,
        seed,
        creatorId,
        currentDay
    }: {
        scenarioId?: number
        seed: string
        creatorId: string
        currentDay: number
    }): Promise<number>

    fetchTotalsList?(): Promise<ITotalsList>

    fetchSnapshotById?(snapshotId: number): Promise<IState>

    auth?()
}
