import HashMap from 'hashmap';
import { IAPI, IState, ITotalsList } from '../../interfaces';
import { Investor, Pool, Quest } from '../../modules';
export interface ConstructorSimConfig {
    dbUrl: string;
    accessToken: string;
}
export default class SimAPI implements IAPI {
    private _dbClient;
    private TABLE;
    private RELATION_TYPE;
    constructor(config: ConstructorSimConfig);
    createQuest(name: string, description: string): boolean;
    createPool(name: string, description: string): boolean;
    citeQuest(questId: number, userId: string): boolean;
    createInvestor(type: string, name: string, initialBalance: number, isDefault?: boolean): Investor;
    saveQuests(quests: Array<Quest>, humanQuests: Array<string> | null, questNamesToInvestorIds: HashMap<string, number>, snapshotId: number): Promise<HashMap<string, number>>;
    saveInvestors(investors: Array<Investor>, snapshotId: number): Promise<HashMap<string, number>>;
    savePools(pools: Array<Pool>, questNameToQuestId: HashMap<string, number>, snapshotId: number): Promise<HashMap<string, number>>;
    createSnapshotDataRelation(relationType: any, snapshotId: number, entities: Array<{
        id: number;
        name: string;
    }>): Promise<void>;
    saveScenario(scenarioName: string, investorConfigs: Record<string, any>, questConfigs: Record<string, any>): Promise<number>;
    saveSwaps(swapsArray: object[], poolMappings: HashMap<string, number>, investorMappings: HashMap<string, number>): Promise<void>;
    saveLogs(logsArray: object[], poolMappings: HashMap<string, number>, investorMappings: HashMap<string, number>): Promise<void>;
    savePositionsData(pools: Pool[], poolMappings: HashMap<string, number>, investorMappings: HashMap<string, number>): Promise<boolean>;
    saveInvestorBalances(investorBalancesByDay: Array<[number, Record<string, object[]>]>, investorHashToInvestorId: HashMap<string, number>, questNameToQuestId: HashMap<string, number>): Promise<void>;
    saveInvestorNavs(investorNavsByDay: Array<[number, Record<string, number>]>, investorHashToInvestorId: HashMap<string, number>): Promise<void>;
    saveSnapshotTotals(snapshotId: number, { quests, pools, investors }: {
        quests: Quest[];
        pools: Pool[];
        investors: Investor[];
    }): Promise<any>;
    saveSnapshot({ scenarioId, seed, creatorId, currentDay }: {
        scenarioId?: number;
        seed: string;
        creatorId: string;
        currentDay: number;
    }): Promise<number>;
    fetchTotalsList(): Promise<ITotalsList>;
    fetchSnapshotById(snapshotId: number): Promise<IState>;
    get auth(): any;
}
//# sourceMappingURL=SimAPI.d.ts.map