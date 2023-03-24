import { IAPI } from '@/common/interfaces' // TODO: should implement universal Interface
import { Pool } from '@/blockchain/modules/Pool'
import { ethers } from 'ethers'
import {
    initializeUniswapContracts,
    TUniswapContracts
} from '@/blockchain/utils/initializeUniswapContracts'
import { Quest } from '@/blockchain/modules'

export interface Web3ApiConfig {
    provider: ethers.providers.JsonRpcProvider
    signer: ethers.Signer
    contracts: TUniswapContracts
}

const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)
const provider = new ethers.providers.StaticJsonRpcProvider(providerUrl)
const signer = new ethers.Wallet(privateKey, provider)
const contracts = initializeUniswapContracts(signer)
const DEFAULT_CONFIG: Web3ApiConfig = {
    provider,
    signer,
    contracts
}
export default class Web3API implements IAPI {
    constructor(private config: Web3ApiConfig) {}

    async createQuest(
        name: string,
        kind: string,
        content: string
    ): Promise<Quest> {
        return Quest.create(name, kind, content, this.config)
    }

    // deploys UniswapV3 pool and returns Pool entity
    async createPool(token0: string, token1: string): Promise<Pool> {
        return Pool.create(token0, token1, this.config)
    }

    async openPoolPosition(pool: Pool, initialValues) {
        const { min, max, tokenA, tokenB } = initialValues
        return pool.openPosition(min, max, tokenA, tokenB)
    }

    async swap(pool: Pool, amount: number, zeroForOne: boolean) {
        return pool.swap(amount, zeroForOne)
    }

    citeQuest(questId: number, userId: string): boolean {
        // alternate implementation details
        return true
    }
}
