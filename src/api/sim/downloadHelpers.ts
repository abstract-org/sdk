import HashMap from 'hashmap'
import setInto from 'lodash/set'
import { IState, TWalletHash, TPoolName } from '../../interfaces'
import {
    ScenarioWalletConfigDto,
    ScenarioQuestConfigDto,
    WalletDto,
    PoolDto,
    SwapDto,
    LogDto,
    QuestDto
} from './dtos/'
import {
    addStringToArrayUniq,
    convertArrayToHashMapByKey,
    createHashMappings
} from '../../utils/logicUtils'

import { Wallet, Pool } from '../../modules'

export function gatherStateFromSnapshot(data): IState {
    let newState = makeEmptyState()
    newState.dayTrackerStore.currentDay = data.current_day + 1
    newState.generatorStore = transformScenario(data.scenario)

    const { wallets, walletStoreWallets, walletNavs, walletBalances } =
        aggregateWalletsForStore(data.wallet)
    newState.walletStore.wallets = walletStoreWallets
    newState.wallets = wallets
    newState.historical.walletNavs = walletNavs
    newState.historical.walletBalances = walletBalances

    const { pools, poolStorePools } = aggregatePoolsForStore(data.pool)
    newState.poolStore.pools = poolStorePools
    newState.pools = pools
    newState.poolStore.active = poolStorePools[0]

    const questNamesToPoolNames = gatherPoolNamesByQuestName(pools)
    const { quests, questStore } = aggregateQuestsForStore(
        data.quest,
        questNamesToPoolNames
    )
    newState.questStore.quests = questStore.quests
    newState.questStore.humanQuests = questStore.humanQuests
    newState.quests = quests

    const { totalSwaps, totalLogs } = extractTotalSwapsAndLogs(data.pool)

    newState.poolStore.swaps = aggregateSwapsForStore(totalSwaps, data)

    const { logs } = aggregateLogsForStore(totalLogs)
    newState.logStore.logObjs = logs

    return <IState>newState
}

const makeEmptyState = () => ({
    generatorStore: { invConfigs: [], questConfigs: [] },
    walletStore: { wallets: [] },
    wallets: new HashMap(),
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
        walletNavs: {},
        walletBalances: {}
    },
    moneyDist: {
        citing: [],
        buying: [],
        selling: [],
        buyingSmart: [],
        sellingSmart: []
    }
})

const transformScenario = (scenario) => {
    return {
        invConfigs: scenario.scenario_wallet_config.map((cfg) =>
            new ScenarioWalletConfigDto(cfg).toObj()
        ),
        questConfigs: scenario.scenario_quest_config.map((cfg) =>
            new ScenarioQuestConfigDto(cfg).toObj()
        )
    }
}

const gatherHistoricalInvBalances = (invDtoList) => {
    const allInvBalances = invDtoList.reduce((resultList, invDto) => {
        const currentWalletBalanceList = invDto.wallet_balances.map(
            (invBalanceItem) => ({
                walletHash: invDto.hash,
                token: invBalanceItem.quest.name,
                day: invBalanceItem.day,
                balance: invBalanceItem.balance
            })
        )
        resultList.push(...currentWalletBalanceList)

        return resultList
    }, [])

    let result = {}
    for (const { day, walletHash, token, balance } of allInvBalances) {
        setInto(result, [day, walletHash, token], balance)
    }

    return result
}

const aggregateWalletsForStore = (
    data
): {
    walletStoreWallets: Array<TWalletHash>
    wallets: HashMap<TWalletHash, Wallet>
    walletNavs: object
    walletBalances: object
} => {
    const walletDtoList = data.map((ssInv) => new WalletDto(ssInv))

    return {
        walletStoreWallets: walletDtoList.map((invDto) => invDto.toHash()),
        wallets: convertArrayToHashMapByKey(
            walletDtoList.map((invDto) => invDto.toWallet()),
            'hash'
        ),
        walletNavs: walletDtoList.reduce((result, invDto) => {
            invDto.wallet_navs.forEach(({ day, usdc_nav }) => {
                setInto(result, [day, invDto.hash], usdc_nav)
            })

            return result
        }, {}),
        walletBalances: gatherHistoricalInvBalances(walletDtoList)
    }
}

const aggregatePoolsForStore = (
    data
): {
    poolStorePools: Array<TPoolName>
    pools: HashMap<TPoolName, Pool>
} => {
    const poolDtoList = data.map((ssPool) => new PoolDto(ssPool))

    return {
        poolStorePools: poolDtoList.map((poolDto) => poolDto.toName()),
        pools: convertArrayToHashMapByKey(
            poolDtoList.map((poolDto) => poolDto.toPool()),
            'name'
        )
    }
}

const aggregateSwapsForStore = (data, respData) => {
    const poolNamesById = createHashMappings(respData.pool, 'id', 'name')
    const invHashById = createHashMappings(respData.wallet, 'id', 'hash')

    return data.map((ssSwap) =>
        new SwapDto(ssSwap, poolNamesById, invHashById).toObj()
    )
}

const ascBlkComparator = (objA, objB) => objA.blk - objB.blk

const aggregateLogsForStore = (data) => {
    const logObjList = data
        .map((ssLog) => new LogDto(ssLog).toObj())
        .sort(ascBlkComparator)

    return {
        logs: logObjList
    }
}

const gatherPoolNamesByQuestName = (hmPools) =>
    hmPools.values().reduce(
        (qMap, p) => ({
            ...qMap,
            [p.tokenLeft]: addStringToArrayUniq(qMap[p.tokenLeft], p.name),
            [p.tokenRight]: addStringToArrayUniq(qMap[p.tokenRight], p.name)
        }),
        {}
    )

const aggregateQuestsForStore = (data, questPoolNames) => {
    const questDtoList = data.map(
        (ssQuest) => new QuestDto(ssQuest, questPoolNames[ssQuest.name])
    )

    return {
        questStore: {
            quests: questDtoList
                .filter((questDto) => questDto.name !== 'USDC')
                .map((questDto) => questDto.toName()),
            humanQuests: questDtoList
                .filter((questDto) => questDto.is_human)
                .map((questDto) => questDto.toName())
        },
        quests: convertArrayToHashMapByKey(
            questDtoList.map((questDto) => questDto.toQuest()),
            'name'
        )
    }
}

const extractTotalSwapsAndLogs = (data) => {
    return data.reduce(
        (sum, current) => {
            return {
                totalSwaps: [...sum.totalSwaps, ...current.swap],
                totalLogs: [...sum.totalLogs, ...current.log]
            }
        },
        { totalSwaps: [], totalLogs: [] }
    )
}
