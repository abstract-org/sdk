import 'reflect-metadata'
import { ConstructorSimConfig } from './api/sim/SimAPI'
import {
    DEFAULT_TOKEN_SUPPLY,
    Web3ApiConfig,
    initializeDefaultToken,
    initializeTokenFactory,
    initializeUniswapContracts
} from './api/web3/Web3API'
import {
    PoolPersistenceService,
    QuestPersistenceService,
    WalletPersistenceService,
    SupabaseRepository
} from './common/services'
import {
    IDataStoreRepository,
    IPoolPersistence,
    IQuestPersistence,
    IWalletPersistance
} from './common/interfaces'
import Web3API from './api/web3/Web3API'
import { Pool } from './blockchain/modules'
import { FeeAmount } from '@uniswap/v3-sdk'
import { generateNameAndSymbol } from './utils/createNameAndSymbol'

const getPersistenceLayer = (
    repository
): {
    PoolPersistence: IPoolPersistence
    QuestPersistence: IQuestPersistence
    WalletPersistence: IWalletPersistance
} => {
    return {
        PoolPersistence: new PoolPersistenceService(repository),
        QuestPersistence: new QuestPersistenceService(repository),
        WalletPersistence: new WalletPersistenceService(repository)
    }
}

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
        config: ConstructorSimConfig | Web3ApiConfig
    ): {
        PoolPersistence: IPoolPersistence
        QuestPersistence: IQuestPersistence
        WalletPersistence: IWalletPersistance
    } {
        let repository: IDataStoreRepository

        switch (adapter) {
            case 'supabase':
                repository = new SupabaseRepository(
                    config as ConstructorSimConfig
                )
                break
            default:
                repository = new SupabaseRepository(
                    config as ConstructorSimConfig
                )
                break
        }

        return { ...getPersistenceLayer(repository) }
    }

    static initWithDataStore(dataStore: IDataStoreRepository): {
        PoolPersistence: IPoolPersistence
        QuestPersistence: IQuestPersistence
        WalletPersistence: IWalletPersistance
    } {
        return { ...getPersistenceLayer(dataStore) }
    }
}

export * as LogicUtils from './common/utils/logicUtils'
export * as MathUtils from './common/utils/mathUtils'
export * as Modules from './common/modules'
export * from './common/types'
export * from './common/interfaces'
export { WrapperService } from './common/services/WrapperService'
export { sha256, createBlockHash } from './utils/createHash'
export {
    Web3API,
    initializeDefaultToken,
    initializeTokenFactory,
    initializeUniswapContracts
}
export type { Web3ApiConfig }
export { Pool as Web3Pool }
export { FeeAmount }
export { DEFAULT_TOKEN_SUPPLY }
export { generateNameAndSymbol }
