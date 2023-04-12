import { IAPI } from '@/common/interfaces' // TODO: should implement universal Interface
import { Pool, TDeployParams } from '@/blockchain/modules/Pool'
import { ethers } from 'ethers'
import {
    initializeUniswapContracts,
    TUniswapContracts
} from '@/blockchain/utils/initializeUniswapContracts'
import { initializeDefaultToken } from '@/blockchain/utils/initializeDefaultToken'
import { Quest } from '@/blockchain/modules'
import { initializeTokenFactory } from '@/blockchain/utils/initializeTokenFactory'
import { FeeAmount } from '@uniswap/v3-sdk'
import { AuthApiError } from '@supabase/supabase-js'

export interface Web3ApiConfig {
    provider: ethers.providers.JsonRpcProvider
    signer: ethers.Signer
    contracts: TUniswapContracts & { tokenFactory: ethers.Contract }
    defaultToken: ethers.Contract
}

const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)
const provider = new ethers.providers.StaticJsonRpcProvider(providerUrl)
const signer = new ethers.Wallet(privateKey, provider)
const DEFAULT_CONFIG: Web3ApiConfig = {
    provider,
    signer,
    contracts: {
        ...initializeUniswapContracts(signer),
        tokenFactory: initializeTokenFactory(signer)
    },
    defaultToken: initializeDefaultToken(signer)
}
export const DEFAULT_TOKEN_SUPPLY = 20000

// export default class Web3API implements IAPI {
export default class Web3API {
    constructor(private config: Web3ApiConfig) {}

    async createQuest(
        name: string,
        kind: string,
        content: string,
        options: { supply?: number } = {}
    ): Promise<Quest> {
        const supply = options.supply || DEFAULT_TOKEN_SUPPLY
        return Quest.create(supply, this.config, { name, kind, content })
    }

    // deploys UniswapV3 pool and returns Pool entity
    async createPool(
        token0: string,
        token1: string,
        options: TDeployParams
    ): Promise<Pool> {
        const pool = await Pool.create(token0, token1, options.fee, this.config)
        const deployParams = {
            fee: options.fee,
            sqrtPrice: options.sqrtPrice,
            deployGasLimit: options.deployGasLimit
        }
        await pool.deployPool(deployParams)

        return pool
    }

    async openPoolPosition(pool: Pool, initialValues) {
        const { min, max, tokenA, tokenB } = initialValues
        const positionParams = [min, max, tokenA, tokenB].join(',')
        return pool.openPosition(positionParams)
    }

    async swap(pool: Pool, amount: number | string, zeroForOne: boolean) {
        return pool.swapExactInputSingle(String(amount), zeroForOne)
    }

    citeQuest(questId: number, userId: string): boolean {
        return true
    }
}
