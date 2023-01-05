import { createClient } from '@supabase/supabase-js'
import HashMap from 'hashmap'
import { IAPI, IState, ITotalsList, TPoolName } from '../../interfaces'
import { Investor, Pool, Quest } from '../../modules'
import { createHashMappings } from '../../utils/logicUtils'
import { getQuerySnapshotById, RELATION_TYPE, TABLE } from './constants'
import {
    InvestorUploadDto,
    PoolUploadDto,
    QuestUploadDto,
    PoolDataUploadDto,
    ScenarioUploadDto,
    ScenarioInvestorConfigUploadDto,
    ScenarioQuestConfigUploadDto,
    SwapUploadDto,
    LogUploadDto,
    PositionUploadDto,
    PosOwnersUploadDto,
    InvestorBalancesUploadDto,
    InvestorNavsUploadDto,
    SnapshotTotalsUploadDto,
    SnapshotUploadDto,
    SnapshotWithTotalsDto,
    QuestDto
} from './dtos'
import { gatherStateFromSnapshot } from './downloadHelpers'

export interface ConstructorSimConfig {
    dbUrl: string
    accessToken: string
}

export default class SimAPI implements IAPI {
    private _dbClient
    private TABLE: Record<string, string>
    private RELATION_TYPE: Record<string, string>

    constructor(config: ConstructorSimConfig) {
        this._dbClient = createClient(config.dbUrl, config.accessToken)
        this.TABLE = TABLE
        this.RELATION_TYPE = RELATION_TYPE
    }

    async createQuest(
        snapshotId: number,
        investorId: number,
        questData: Partial<Omit<Quest, 'id'>>,
        followingId?: string
    ): Promise<Quest> {
        const quest = Quest.create(questData.name)
        try {
            const questNamesToId = await this.saveQuests(
                [quest],
                [quest.name],
                new HashMap([[quest.name, investorId]]),
                snapshotId
            )

            let pool
            if (followingId) {
                const tokenLeft = await this.fetchQuest(followingId)
                questNamesToId.set(tokenLeft.name, tokenLeft.id)
                pool = quest.createPool({ tokenLeft })
            } else {
                // TODO: define if we need USDC pool for each quest
                // pool = quest.createPool()
            }

            const poolResponse =
                pool &&
                (await this.savePools([pool], questNamesToId, snapshotId))

            if (!poolResponse) {
                // rollback quest creation
                // await this.deleteQuest(questNamesToId.get(ques.name))
                // return null
            }

            return quest
        } catch (err) {
            console.log(err)
            return null
        }
    }

    createPool(name: string, description: string): boolean {
        // implementation details
        return true
    }

    citeQuest(questId: number, userId: string): boolean {
        // implementation details
        return true
    }

    createInvestor(
        type: string,
        name: string,
        initialBalance: number,
        isDefault?: boolean
    ): Investor {
        return Investor.create(type, name, initialBalance, isDefault)
    }

    async saveQuests(
        quests: Array<Quest>,
        humanQuests: Array<string> | null,
        questNamesToInvestorIds: HashMap<string, number>,
        snapshotId: number
    ): Promise<HashMap<string, number>> {
        try {
            const preparedQuests = quests.map((quest) => {
                const isHuman = !humanQuests || humanQuests.includes(quest.name)
                return new QuestUploadDto(
                    { ...quest, isHuman },
                    questNamesToInvestorIds
                )
            })

            const questDbResponse = await this._dbClient
                .from(this.TABLE.quest)
                .insert(preparedQuests)
                .select('id, name')

            await this.createSnapshotDataRelation(
                this.RELATION_TYPE.QUEST,
                snapshotId,
                questDbResponse.data
            )

            if (!questDbResponse.data) {
                return
            }

            return createHashMappings(questDbResponse.data, 'name', 'id')
        } catch (err) {
            console.log(`saveQuests() error: `, err.message)
        }
    }

    async saveInvestors(
        investors: Array<Investor>,
        snapshotId: number
    ): Promise<HashMap<string, number>> {
        try {
            const preparedInvestors = investors.map(
                (inv) => new InvestorUploadDto(inv)
            )

            const investorDbResponse = await this._dbClient
                .from(TABLE.investor)
                .insert(preparedInvestors)
                .select('id, hash')

            await this.createSnapshotDataRelation(
                RELATION_TYPE.INVESTOR,
                snapshotId,
                investorDbResponse.data
            )

            console.log('saveInvestors(): Investors inserted')

            if (!investorDbResponse.data) {
                return
            }

            return createHashMappings(investorDbResponse.data, 'hash', 'id')
        } catch (e) {
            console.log('aggregateInvestorsData error: ', e.message)
            return null
        }
    }

    async savePools(
        pools: Array<Pool>,
        questNameToQuestId: HashMap<string, number>,
        snapshotId: number
    ): Promise<HashMap<string, number>> {
        try {
            const preparedPools = pools.map(
                (poolValue) => new PoolUploadDto(poolValue, questNameToQuestId)
            )

            const poolDbResponse = await this._dbClient
                .from(TABLE.pool)
                .insert(preparedPools)
                .select('id, name')

            let poolNameToPoolId
            if (poolDbResponse.data) {
                poolNameToPoolId = createHashMappings(
                    poolDbResponse.data,
                    'name',
                    'id'
                )
            }

            console.log('savePools(): Pools inserted')

            const preparedPoolDataList = pools.map(
                (pool) => new PoolDataUploadDto(pool, poolNameToPoolId)
            )

            await Promise.all([
                await this.createSnapshotDataRelation(
                    RELATION_TYPE.POOL,
                    snapshotId,
                    poolDbResponse.data
                ),
                await this._dbClient
                    .from(TABLE.pool_data)
                    .insert(preparedPoolDataList)
            ])

            return poolNameToPoolId
        } catch (err) {
            console.log('savePools() error: ', err.message)
            return null
        }
    }

    async createSnapshotDataRelation(
        relationType,
        snapshotId: number,
        entities: Array<{ id: number; name: string }>
    ): Promise<void> {
        try {
            const formattedSnapshotData = entities.map(({ id }) => ({
                snapshot_id: snapshotId,
                entity_id: id
            }))

            switch (relationType) {
                case this.RELATION_TYPE.INVESTOR:
                    return await this._dbClient
                        .from(TABLE.snapshot_investor)
                        .insert(formattedSnapshotData)
                case this.RELATION_TYPE.QUEST:
                    return await this._dbClient
                        .from(TABLE.snapshot_quest)
                        .insert(formattedSnapshotData)
                case this.RELATION_TYPE.POOL:
                    return await this._dbClient
                        .from(TABLE.snapshot_pool)
                        .insert(formattedSnapshotData)
                default:
                    break
            }
        } catch (err) {
            console.log(
                `createSnapshotDataRelation() error (relation ${relationType}): `,
                err.message
            )
        }
    }

    async saveScenario(
        scenarioName: string,
        investorConfigs: Record<string, any>,
        questConfigs: Record<string, any>
    ): Promise<number> {
        try {
            const scenarioDbResponse = await this._dbClient
                .from(TABLE.scenario)
                .insert(
                    new ScenarioUploadDto({ name: `scenario-${scenarioName}` })
                )
                .select('id')
                .limit(1)
                .single()

            if (scenarioDbResponse.data) {
                const scenarioId = scenarioDbResponse.data.id

                console.log(
                    'saveScenario() Scenario Created with ID: ',
                    scenarioId
                )

                const preparedInvestorConfigs = investorConfigs.map(
                    (invConfig) =>
                        new ScenarioInvestorConfigUploadDto(
                            invConfig,
                            scenarioId
                        )
                )

                const preparedQuestConfigs = questConfigs.map(
                    (questConfig) =>
                        new ScenarioQuestConfigUploadDto(
                            questConfig,
                            scenarioId
                        )
                )

                await Promise.all([
                    this._dbClient
                        .from(TABLE.scenario_investor_config)
                        .insert(preparedInvestorConfigs),
                    this._dbClient
                        .from(TABLE.scenario_quest_config)
                        .insert(preparedQuestConfigs)
                ])

                console.log(
                    '[SupabaseService] aggregateScenarioData: Scenario inserted'
                )

                return scenarioId
            } else {
                return null
            }
        } catch (err) {
            console.log('saveScenario() error: ', err.message)
            return null
        }
    }

    async saveSwaps(
        swapsArray: object[],
        poolMappings: HashMap<string, number>,
        investorMappings: HashMap<string, number>
    ): Promise<void> {
        const preparedSwaps = swapsArray.map(
            (swap) => new SwapUploadDto(swap, poolMappings, investorMappings)
        )

        await this._dbClient.from(TABLE.swap).insert(preparedSwaps)

        console.log('saveSwaps() completed')
    }

    async saveLogs(
        logsArray: object[],
        poolMappings: HashMap<string, number>,
        investorMappings: HashMap<string, number>
    ): Promise<void> {
        const preparedLogs = logsArray.map(
            (log, idx) =>
                new LogUploadDto(log, poolMappings, investorMappings, idx)
        )

        await this._dbClient.from(TABLE.log).insert(preparedLogs)

        console.log('saveLogs() completed')
    }

    async savePositionsData(
        pools: Pool[],
        poolMappings: HashMap<string, number>,
        investorMappings: HashMap<string, number>
    ): Promise<boolean> {
        try {
            let preparedPositions = []
            let preparedPosOwners = []

            pools.forEach((pool) => {
                const poolId = poolMappings.get(pool.name)
                const poolPositions = pool.pos
                    .values()
                    .map((position) => new PositionUploadDto(position, poolId))
                const poolPosOwners = pool.posOwners.map((posOwnerData) => {
                    let investorId = investorMappings.get(posOwnerData.hash)

                    return new PosOwnersUploadDto(
                        posOwnerData,
                        poolId,
                        investorId
                    )
                })

                preparedPosOwners.push(...poolPosOwners)
                preparedPositions.push(...poolPositions)
            })

            await Promise.all([
                this._dbClient.from(TABLE.position).insert(preparedPositions),
                this._dbClient
                    .from(TABLE.position_owner)
                    .insert(preparedPosOwners)
            ])

            console.log('savePositionsData() Positions/PosOwners inserted')

            return true
        } catch (err) {
            console.log('savePositionsData() error: ', err.message)
            return null
        }
    }

    async saveInvestorBalances(
        investorBalancesByDay: Array<[number, Record<string, object[]>]>,
        investorHashToInvestorId: HashMap<string, number>,
        questNameToQuestId: HashMap<string, number>
    ): Promise<void> {
        try {
            const preparedInvestorBalances = []

            for (const [day, investorDayBalances] of investorBalancesByDay) {
                Object.entries(investorDayBalances).forEach(
                    ([investorHash, balances]) => {
                        const investor_id =
                            investorHashToInvestorId.get(investorHash)
                        Object.entries(balances).forEach(
                            ([tokenName, balance]) => {
                                const quest_id =
                                    questNameToQuestId.get(tokenName)

                                preparedInvestorBalances.push(
                                    new InvestorBalancesUploadDto({
                                        investor_id,
                                        quest_id,
                                        balance,
                                        day
                                    })
                                )
                            }
                        )
                    }
                )
            }

            await this._dbClient
                .from(TABLE.investor_balances)
                .insert(preparedInvestorBalances)

            console.log('saveInvestorBalances() completed')
        } catch (err) {
            console.log('saveInvestorBalances() error: ', err.message)
            return null
        }
    }

    async saveInvestorNavs(
        investorNavsByDay: Array<[number, Record<string, number>]>,
        investorHashToInvestorId: HashMap<string, number>
    ): Promise<void> {
        try {
            const preparedInvestorNavs = []

            for (const [day, invNavs] of investorNavsByDay) {
                Object.entries(invNavs).forEach(([hash, nav]) => {
                    preparedInvestorNavs.push(
                        new InvestorNavsUploadDto({
                            investor_id: investorHashToInvestorId.get(hash),
                            usdc_nav: nav,
                            token_nav: nav,
                            day
                        })
                    )
                })
            }

            await this._dbClient
                .from(TABLE.investor_navs)
                .insert(preparedInvestorNavs)

            console.log('saveInvestorNavs() completed')
        } catch (err) {
            console.log('saveInvestorNavs() error: ', err.message)
            return null
        }
    }

    async saveSnapshotTotals(
        snapshotId: number,
        {
            quests,
            pools,
            investors
        }: { quests: Quest[]; pools: Pool[]; investors: Investor[] }
    ): Promise<any> {
        let marketCap = 0
        let totalValueLocked = 0
        let totalUSDCLocked = 0
        pools.forEach((pool) => {
            if (pool.isQuest()) {
                marketCap += pool.getMarketCap()
                totalValueLocked += pool.getTVL()
                totalUSDCLocked += pool.getUSDCValue()
            }
        })

        const preparedTotals = new SnapshotTotalsUploadDto({
            snapshot_id: snapshotId,
            quests: quests.length,
            cross_pools: pools.filter((p) => !p.isQuest()).length,
            investors: investors.length,
            tvl: totalValueLocked,
            mcap: marketCap,
            usdc: totalUSDCLocked
        })

        return this._dbClient.from(TABLE.snapshot_totals).insert(preparedTotals)
    }

    async saveSnapshot({
        scenarioId = 1,
        seed,
        creatorId,
        currentDay
    }: {
        scenarioId?: number
        seed: string
        creatorId: string
        currentDay: number
    }): Promise<number> {
        const preparedSnapshot = new SnapshotUploadDto({
            seed,
            scenarioId,
            creatorId,
            currentDay
        })
        const snapshotDbResponse = await this._dbClient
            .from(TABLE.snapshot)
            .insert(preparedSnapshot)
            .select('id')
            .limit(1)
            .single()

        return snapshotDbResponse.data.id
    }

    async fetchTotalsList(): Promise<ITotalsList> {
        const { data, error } = await this._dbClient.from(TABLE.snapshot)
            .select(`
            *, 
            ${TABLE.snapshot_totals}(*),
            scenario:scenario_id ( name ),
            creator: creator_id ( email )
            `)
        const creatorsResponse = await this._dbClient
            .from(TABLE.user)
            .select('email')

        if (error || creatorsResponse.error) {
            console.error('fetchTotalsList().error:', error)
        }

        return {
            snapshots: data.map((snapshotData) =>
                new SnapshotWithTotalsDto(snapshotData).toObj()
            ),
            creators: creatorsResponse.data
        }
    }

    async fetchSnapshotById(snapshotId: number): Promise<IState> {
        try {
            const snapshotResponse = await this._dbClient
                .from(TABLE.snapshot)
                .select(getQuerySnapshotById())
                .eq('id', snapshotId)
                .limit(1)
                .single()

            if (snapshotResponse.error) {
                console.error(snapshotResponse.error.message)
                return null
            }

            return gatherStateFromSnapshot(snapshotResponse.data)
        } catch (err) {
            console.error('ERR: fetchTotalsById()', err)
            return null
        }
    }

    async fetchQuest(questId: string): Promise<Quest> {
        let quest: Quest
        try {
            const { data } = await this._dbClient
                .from(TABLE.quest)
                .select('*, pools')
                .eq('id', Number(questId))
                .maybeSingle()
            const questPools = await this.fetchQuestPools(questId)
            if (data) {
                quest = new QuestDto(data, questPools).toQuest() as Quest
            }
        } catch (err) {
            console.error('ERR: fetchQuests()', err)
        }

        return quest
    }

    async fetchQuestPools(questId: string): Promise<TPoolName[]> {
        let result = []
        try {
            const { data } = await this._dbClient
                .from(TABLE.pool)
                .select(
                    `id,
                    name,
                    leftId:token1(id),
                    rightId:token1(id)`
                )
                .or(`leftId.eq.${questId},rightId.eq.${questId}`)
            result = data && data.map((pool) => pool.name)
        } catch (err) {
            console.error('ERR: fetchQuests()', err)
        }

        return result
    }

    get auth() {
        return this._dbClient.auth
    }
}
