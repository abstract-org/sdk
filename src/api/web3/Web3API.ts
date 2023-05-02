import { IAPI } from '../../common/interfaces' // TODO: should implement universal Interface
import { Pool, TDeployParams } from '../../blockchain/modules/Pool'
import { Signer, ethers, utils } from 'ethers'
import {
    initializeUniswapContracts,
    TUniswapContracts
} from '../../blockchain/utils/initializeUniswapContracts'
import { initializeDefaultToken } from '../../blockchain/utils/initializeDefaultToken'
import { Quest } from '../../blockchain/modules'
import { initializeTokenFactory } from '../../blockchain/utils/initializeTokenFactory'
import { FeeAmount } from '@uniswap/v3-sdk'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'

export interface Web3ApiConfig {
    provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider
    signer: ethers.Signer
    contracts: TUniswapContracts & { tokenFactory: ethers.Contract }
    defaultToken: ethers.Contract
}

export const DEFAULT_TOKEN_SUPPLY = 20000

export { initializeDefaultToken }
export { initializeTokenFactory }
export { initializeUniswapContracts }

// export default class Web3API implements IAPI {
export default class Web3API {
    constructor(private config: Web3ApiConfig) {}

    async getTokenAddress(
        kind,
        content,
        name,
        symbol,
        totalSupply,
        provider,
        signer,
        bytecode,
        factoryAddress
    ): Promise<string> {
        const ethereum = provider

        if (!ethereum) {
            throw new Error('MetaMask not connected')
        }

        // Encode the constructor parameters
        const constructorData = utils.defaultAbiCoder.encode(
            ['string', 'string', 'uint256', 'address'],
            [name, symbol, totalSupply, signer]
        )

        // Concatenate the bytecode and constructor data
        const tokenBytecode = `${bytecode}${constructorData.slice(2)}`

        // Calculate salt and initCodeHash
        const salt = utils.solidityKeccak256(
            ['string', 'string'],
            [kind, content]
        )
        const initCodeHash = utils.keccak256(tokenBytecode)

        // Calculate the future create2 address
        const create2Address = utils.getCreate2Address(
            factoryAddress,
            salt,
            initCodeHash
        )

        return create2Address
    }

    async getToken(
        address: string,
        abi: string,
        signer: Signer,
        provider: Web3Provider | JsonRpcProvider
    ): Promise<any> {
        const bytecode = await provider.getCode(address)

        if (bytecode === '0x' || bytecode === '0x0') {
            return null
        }

        const tokenInstance = new ethers.Contract(address, abi, signer)

        return tokenInstance
    }

    async getPool(
        token0Address: string,
        token1Address: string,
        feeAmount: FeeAmount
    ): Promise<any> {
        let pool = await Pool.create(
            token0Address,
            token1Address,
            feeAmount,
            this.config
        )
        let poolContract

        poolContract = await pool.getPoolContract(
            token0Address,
            token1Address,
            feeAmount
        )

        if (!poolContract) {
            // Try swapped direction
            poolContract = await pool.getPoolContract(
                token1Address,
                token0Address,
                feeAmount
            )
        }

        return poolContract
    }

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

    citeQuest(questHash: string, userId: string): boolean {
        return true
    }
}
