import { createClient } from '@supabase/supabase-js'
import HashMap from 'hashmap'

import { IAPI } from '../../interfaces'
import { Investor, Pool, Quest } from "../../modules";
import { createHashMappings } from '../../utils/logicUtils'
import { RELATION_TYPE, TABLE } from './constants'
import InvestorUploadDto from './dtos/InvestorUploadDto'
import PoolUploadDto from './dtos/PoolUploadDto'
import QuestUploadDto from './dtos/QuestUploadDto'
import PoolDataUploadDto from './dtos/PoolDataUploadDto'

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

    citeQuest(questId: number, userId: string): boolean {
        // implementation details
        return true
    }

    createInvestor(type: string, name: string, initialBalance: number, isDefault?: boolean): Investor {
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

            const preparedPoolDataList = pools.map((pool) =>
                new PoolDataUploadDto(pool, poolNameToPoolId)
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
}
