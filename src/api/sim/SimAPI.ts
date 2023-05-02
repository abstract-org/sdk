import { createClient } from '@supabase/supabase-js'
import HashMap from 'hashmap'

import { IAPI, IState, ITotalsList } from '../../common/interfaces'
import { Wallet, Pool, Quest } from '../../common/modules'
import { createHashMappings } from '../../common/utils/logicUtils'
import { getQuerySnapshotById, RELATION_TYPE, TABLE } from './constants'
import {
    WalletUploadDto,
    PoolUploadDto,
    QuestUploadDto,
    PoolDataUploadDto,
    ScenarioUploadDto,
    ScenarioWalletConfigUploadDto,
    ScenarioQuestConfigUploadDto,
    SwapUploadDto,
    LogUploadDto,
    PositionUploadDto,
    PosOwnersUploadDto,
    WalletBalancesUploadDto,
    WalletNavsUploadDto,
    SnapshotTotalsUploadDto,
    SnapshotUploadDto,
    SnapshotWithTotalsDto
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

    createQuest(name: string, description: string): boolean {
        // implementation details
        return true
    }

    createPool(name: string, description: string): boolean {
        // implementation details
        return true
    }

    citeQuest(questHash: string, userId: string): boolean {
        // implementation details
        return true
    }

    createWallet(
        type: string,
        name: string,
        initialBalance: number,
        isDefault?: boolean
    ): Wallet {
        return Wallet.create(type, name, initialBalance, isDefault)
    }

    async saveQuests(
        quests: Array<Quest>,
        humanQuests: Array<string> | null,
        questNamesToWalletIds: HashMap<string, number>,
        snapshotId: number
    ): Promise<HashMap<string, number>> {
        try {
            const preparedQuests = quests.map((quest) => {
                const isHuman = !humanQuests || humanQuests.includes(quest.name)
                return new QuestUploadDto(
                    { ...quest, isHuman },
                    questNamesToWalletIds
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

    async saveWallets(
        wallets: Array<Wallet>,
        snapshotId: number
    ): Promise<HashMap<string, number>> {
        try {
            const preparedWallets = wallets.map(
                (inv) => new WalletUploadDto(inv)
            )

            const walletDbResponse = await this._dbClient
                .from(TABLE.wallet)
                .insert(preparedWallets)
                .select('id, hash')

            await this.createSnapshotDataRelation(
                RELATION_TYPE.INVESTOR,
                snapshotId,
                walletDbResponse.data
            )

            console.log('saveWallets(): Wallets inserted')

            if (!walletDbResponse.data) {
                return
            }

            return createHashMappings(walletDbResponse.data, 'hash', 'id')
        } catch (e) {
            console.log('aggregateWalletsData error: ', e.message)
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
                        .from(TABLE.snapshot_wallet)
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
        walletConfigs: Record<string, any>,
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

                const preparedWalletConfigs = walletConfigs.map(
                    (invConfig) =>
                        new ScenarioWalletConfigUploadDto(invConfig, scenarioId)
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
                        .from(TABLE.scenario_wallet_config)
                        .insert(preparedWalletConfigs),
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
        walletMappings: HashMap<string, number>
    ): Promise<void> {
        const preparedSwaps = swapsArray.map(
            (swap) => new SwapUploadDto(swap, poolMappings, walletMappings)
        )

        await this._dbClient.from(TABLE.swap).insert(preparedSwaps)

        console.log('saveSwaps() completed')
    }

    async saveLogs(
        logsArray: object[],
        poolMappings: HashMap<string, number>,
        walletMappings: HashMap<string, number>
    ): Promise<void> {
        const preparedLogs = logsArray.map(
            (log, idx) =>
                new LogUploadDto(log, poolMappings, walletMappings, idx)
        )

        await this._dbClient.from(TABLE.log).insert(preparedLogs)

        console.log('saveLogs() completed')
    }

    async savePositionsData(
        pools: Pool[],
        poolMappings: HashMap<string, number>,
        walletMappings: HashMap<string, number>
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
                    let walletId = walletMappings.get(posOwnerData.hash)

                    return new PosOwnersUploadDto(
                        posOwnerData,
                        poolId,
                        walletId
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

    async saveWalletBalances(
        walletBalancesByDay: Array<[number, Record<string, object[]>]>,
        walletHashToWalletId: HashMap<string, number>,
        questNameToQuestId: HashMap<string, number>
    ): Promise<void> {
        try {
            const preparedWalletBalances = []

            for (const [day, walletDayBalances] of walletBalancesByDay) {
                Object.entries(walletDayBalances).forEach(
                    ([walletHash, balances]) => {
                        const wallet_id = walletHashToWalletId.get(walletHash)
                        Object.entries(balances).forEach(
                            ([tokenName, balance]) => {
                                const quest_id =
                                    questNameToQuestId.get(tokenName)

                                preparedWalletBalances.push(
                                    new WalletBalancesUploadDto({
                                        wallet_id,
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
                .from(TABLE.wallet_balances)
                .insert(preparedWalletBalances)

            console.log('saveWalletBalances() completed')
        } catch (err) {
            console.log('saveWalletBalances() error: ', err.message)
            return null
        }
    }

    async saveWalletNavs(
        walletNavsByDay: Array<[number, Record<string, number>]>,
        walletHashToWalletId: HashMap<string, number>
    ): Promise<void> {
        try {
            const preparedWalletNavs = []

            for (const [day, invNavs] of walletNavsByDay) {
                Object.entries(invNavs).forEach(([hash, nav]) => {
                    preparedWalletNavs.push(
                        new WalletNavsUploadDto({
                            wallet_id: walletHashToWalletId.get(hash),
                            usdc_nav: nav,
                            token_nav: nav,
                            day
                        })
                    )
                })
            }

            await this._dbClient
                .from(TABLE.wallet_navs)
                .insert(preparedWalletNavs)

            console.log('saveWalletNavs() completed')
        } catch (err) {
            console.log('saveWalletNavs() error: ', err.message)
            return null
        }
    }

    async saveSnapshotTotals(
        snapshotId: number,
        {
            quests,
            pools,
            wallets
        }: { quests: Quest[]; pools: Pool[]; wallets: Wallet[] }
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
            wallets: wallets.length,
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

    get auth() {
        return this._dbClient.auth
    }
}
