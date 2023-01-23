import 'reflect-metadata'
import { ConstructorSimConfig } from './api/sim/SimAPI'
import { ConstructorWeb3Config } from './api/web3/Web3API'
import {
    PoolPersistenceService,
    QuestPersistenceService,
    WalletPersistenceService,
    SupabaseRepository
} from './services'
import {
    IDataStoreRepository,
    IPoolPersistence,
    IQuestPersistence, IWalletPersistance
} from './interfaces'

const getPersistenceLayer = (repository) => ({
    PoolPersistence: new PoolPersistenceService(repository),
    QuestPersistence: new QuestPersistenceService(repository),
    WalletPersistence: new WalletPersistenceService(repository)
})

/**
 * SimSdk - main entry to SDK
 * Initializes Persistence layers with data repository selected based on adapter passed
 *
 * Example of usage:
 *
 * const {PoolPersistence, QuestPersistence} = SimSdk.init('supabase', {dbUrl: '', accessToken: ''})
 * const pools = await PoolPersistence.getPools(['hash1', 'hash2'])
 */
export class SimSdk {
    static init(
        adapter: string = 'supabase',
        config: ConstructorSimConfig | ConstructorWeb3Config
    ): {
        PoolPersistence: IPoolPersistence
        QuestPersistence: IQuestPersistence,
        WalletPersistence: IWalletPersistance
    } {
        let repository: IDataStoreRepository

        switch (adapter) {
            case 'supabase':
                repository = new SupabaseRepository(config as ConstructorSimConfig)
                break
            default:
                repository = new SupabaseRepository(config as ConstructorSimConfig)
                break
        }

        return { ...getPersistenceLayer(repository) }
    }

    static initWithDataStore(dataStore: IDataStoreRepository): {
        PoolPersistence: IPoolPersistence
        QuestPersistence: IQuestPersistence
    } {
        return { ...getPersistenceLayer(dataStore) }
    }
}

export * as LogicUtils from './utils/logicUtils'
export * as MathUtils from './utils/mathUtils'
export * as Modules from './modules'
export * as types from './types'
export * as interfaces from './interfaces'
