import {ISwap, ILog, IPool, IQuest, IPosition, ISnapshot} from "./index";

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

    // Investor API
    openPosition?(poolId: number, position: IPosition): void
    updateInvestorBalances?(): void
    updateInvestorNavs?(config: {investorId: number, day: number, usdcNav: number, tokenNav: number}): void
}
