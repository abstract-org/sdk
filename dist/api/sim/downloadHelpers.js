import HashMap from 'hashmap';
import setInto from 'lodash/set';
import { ScenarioInvestorConfigDto, ScenarioQuestConfigDto, InvestorDto, PoolDto, SwapDto, LogDto, QuestDto } from './dtos/';
import { addStringToArrayUniq, convertArrayToHashMapByKey, createHashMappings } from '../../utils/logicUtils';
export function gatherStateFromSnapshot(data) {
    let newState = makeEmptyState();
    newState.dayTrackerStore.currentDay = data.current_day + 1;
    newState.generatorStore = transformScenario(data.scenario);
    const { investors, investorStoreInvestors, investorNavs, investorBalances } = aggregateInvestorsForStore(data.investor);
    newState.investorStore.investors = investorStoreInvestors;
    newState.investors = investors;
    newState.historical.investorNavs = investorNavs;
    newState.historical.investorBalances = investorBalances;
    const { pools, poolStorePools } = aggregatePoolsForStore(data.pool);
    newState.poolStore.pools = poolStorePools;
    newState.pools = pools;
    newState.poolStore.active = poolStorePools[0];
    const questNamesToPoolNames = gatherPoolNamesByQuestName(pools);
    const { quests, questStore } = aggregateQuestsForStore(data.quest, questNamesToPoolNames);
    newState.questStore.quests = questStore.quests;
    newState.questStore.humanQuests = questStore.humanQuests;
    newState.quests = quests;
    const { totalSwaps, totalLogs } = extractTotalSwapsAndLogs(data.pool);
    newState.poolStore.swaps = aggregateSwapsForStore(totalSwaps, data);
    const { logs } = aggregateLogsForStore(totalLogs);
    newState.logStore.logObjs = logs;
    return newState;
}
const makeEmptyState = () => ({
    generatorStore: { invConfigs: [], questConfigs: [] },
    investorStore: { investors: [] },
    investors: new HashMap(),
    logStore: { logObjs: [] },
    poolStore: {
        pools: [],
        swaps: [],
        active: '',
        swapMode: 'smart'
    },
    pools: new HashMap(),
    questStore: {
        quests: [],
        humanQuests: [],
        selectedQuests: [],
        active: '',
        proMode: false
    },
    quests: new HashMap(),
    dayTrackerStore: { currentDay: 0 },
    historical: {
        investorNavs: {},
        investorBalances: {}
    },
    moneyDist: {
        citing: [],
        buying: [],
        selling: [],
        buyingSmart: [],
        sellingSmart: []
    }
});
const transformScenario = (scenario) => {
    return {
        invConfigs: scenario.scenario_investor_config.map((cfg) => new ScenarioInvestorConfigDto(cfg).toObj()),
        questConfigs: scenario.scenario_quest_config.map((cfg) => new ScenarioQuestConfigDto(cfg).toObj())
    };
};
const gatherHistoricalInvBalances = (invDtoList) => {
    const allInvBalances = invDtoList.reduce((resultList, invDto) => {
        const currentInvestorBalanceList = invDto.investor_balances.map((invBalanceItem) => ({
            investorHash: invDto.hash,
            token: invBalanceItem.quest.name,
            day: invBalanceItem.day,
            balance: invBalanceItem.balance
        }));
        resultList.push(...currentInvestorBalanceList);
        return resultList;
    }, []);
    let result = {};
    for (const { day, investorHash, token, balance } of allInvBalances) {
        setInto(result, [day, investorHash, token], balance);
    }
    return result;
};
const aggregateInvestorsForStore = (data) => {
    const investorDtoList = data.map((ssInv) => new InvestorDto(ssInv));
    return {
        investorStoreInvestors: investorDtoList.map((invDto) => invDto.toHash()),
        investors: convertArrayToHashMapByKey(investorDtoList.map((invDto) => invDto.toInvestor()), 'hash'),
        investorNavs: investorDtoList.reduce((result, invDto) => {
            invDto.investor_navs.forEach(({ day, usdc_nav }) => {
                setInto(result, [day, invDto.hash], usdc_nav);
            });
            return result;
        }, {}),
        investorBalances: gatherHistoricalInvBalances(investorDtoList)
    };
};
const aggregatePoolsForStore = (data) => {
    const poolDtoList = data.map((ssPool) => new PoolDto(ssPool));
    return {
        poolStorePools: poolDtoList.map((poolDto) => poolDto.toName()),
        pools: convertArrayToHashMapByKey(poolDtoList.map((poolDto) => poolDto.toPool()), 'name')
    };
};
const aggregateSwapsForStore = (data, respData) => {
    const poolNamesById = createHashMappings(respData.pool, 'id', 'name');
    const invHashById = createHashMappings(respData.investor, 'id', 'hash');
    return data.map((ssSwap) => new SwapDto(ssSwap, poolNamesById, invHashById).toObj());
};
const ascBlkComparator = (objA, objB) => objA.blk - objB.blk;
const aggregateLogsForStore = (data) => {
    const logObjList = data
        .map((ssLog) => new LogDto(ssLog).toObj())
        .sort(ascBlkComparator);
    return {
        logs: logObjList
    };
};
const gatherPoolNamesByQuestName = (hmPools) => hmPools.values().reduce((qMap, p) => ({
    ...qMap,
    [p.tokenLeft]: addStringToArrayUniq(qMap[p.tokenLeft], p.name),
    [p.tokenRight]: addStringToArrayUniq(qMap[p.tokenRight], p.name)
}), {});
const aggregateQuestsForStore = (data, questPoolNames) => {
    const questDtoList = data.map((ssQuest) => new QuestDto(ssQuest, questPoolNames[ssQuest.name]));
    return {
        questStore: {
            quests: questDtoList
                .filter((questDto) => questDto.name !== 'USDC')
                .map((questDto) => questDto.toName()),
            humanQuests: questDtoList
                .filter((questDto) => questDto.is_human)
                .map((questDto) => questDto.toName())
        },
        quests: convertArrayToHashMapByKey(questDtoList.map((questDto) => questDto.toQuest()), 'name')
    };
};
const extractTotalSwapsAndLogs = (data) => {
    return data.reduce((sum, current) => {
        return {
            totalSwaps: [...sum.totalSwaps, ...current.swap],
            totalLogs: [...sum.totalLogs, ...current.log]
        };
    }, { totalSwaps: [], totalLogs: [] });
};
//# sourceMappingURL=downloadHelpers.js.map