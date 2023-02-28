import HashMap from 'hashmap';
import { Investor, Pool, Quest } from '../modules';
export declare type TQuestName = string;
export declare type TPoolName = string;
export declare type TInvestorHash = string;
export interface IState {
    investors: HashMap<TInvestorHash, Investor>;
    pools: HashMap<TPoolName, Pool>;
    quests: HashMap<TQuestName, Quest>;
    investorStore: {
        investors: TInvestorHash[];
    };
    poolStore: {
        pools: Array<TPoolName>;
        swaps: [];
        active: TPoolName;
        swapMode: string;
    };
    questStore: {
        quests: Array<TQuestName>;
        humanQuests: Array<TQuestName>;
        selectedQuests: Array<TQuestName>;
        active: TQuestName;
        proMode: boolean;
    };
    generatorStore: {
        questConfigs: any[];
        invConfigs: any[];
    };
    logStore: {
        logObjs: any[];
    };
    dayTrackerStore: {
        currentDay: number;
    };
    historical: {
        investorNavs: object;
        investorBalances: object;
    };
    moneyDist: {
        citing: Array<any>;
        buying: Array<any>;
        selling: Array<any>;
        buyingSmart: Array<any>;
        sellingSmart: Array<any>;
    };
}
//# sourceMappingURL=IState.d.ts.map