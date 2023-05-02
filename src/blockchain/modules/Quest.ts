import { ethers, Contract, BigNumber } from 'ethers'
import { TUniswapContracts } from '../../blockchain/utils/initializeUniswapContracts'
import Hex from 'crypto-js/enc-hex'
import sha256 from 'crypto-js/sha256'
import { SimpleToken, SimpleFactory } from '../../blockchain/typechain-types'
import ERC20_ABI from '../../blockchain/abi/ERC20ABI.json'
import SimpleTokenABI from '../../blockchain/abi/SimpleToken.json'
import { Pool } from '../../blockchain/modules/Pool'
import { Web3ApiConfig } from '../../api/web3/Web3API'
import { FeeAmount } from '@uniswap/v3-sdk'
import { encodePriceSqrt } from '../../blockchain/utils/encodedPriceSqrt'

export const TEMP_CONFIG = {
    INITIAL_LIQUIDITY: [
        {
            priceMin: 1,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        },
        {
            priceMin: 20,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        },
        {
            priceMin: 50,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        },
        {
            priceMin: 200,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        }
    ]
}
const DEFAULT_TOTAL_SUPPLY = 20000

export class Quest {
    name: string
    kind: string
    content: string
    hash: string
    tokenContract: ethers.Contract
    defaultToken: ethers.Contract
    creator_hash: string

    private provider: ethers.providers.JsonRpcProvider
    private signer: ethers.Signer
    private contracts: TUniswapContracts & { tokenFactory: ethers.Contract }

    static async create(
        supply: number,
        apiConfig: Web3ApiConfig,
        metadata?: {
            name: string
            kind: string
            content: string
        }
    ): Promise<Quest> {
        const thisToken = new Quest()
        if (metadata) {
            thisToken.name = metadata.name
            thisToken.kind = metadata.kind
            thisToken.content = metadata.content
            thisToken.hash = Hex.stringify(sha256(metadata.name))
        }

        thisToken.provider = apiConfig.provider
        thisToken.signer = apiConfig.signer
        thisToken.contracts = apiConfig.contracts
        thisToken.creator_hash = await apiConfig.signer.getAddress()
        thisToken.defaultToken = apiConfig.defaultToken

        thisToken.tokenContract = await thisToken.deployToken(supply)

        return thisToken
    }

    async deployToken(mintAmount?: number) {
        return this.createToken(mintAmount || DEFAULT_TOTAL_SUPPLY)
    }

    async getBalanceOf(address: string) {
        return await this.tokenContract.connect(this.signer).balanceOf(address)
    }

    async createToken(
        mintAmount: number = DEFAULT_TOTAL_SUPPLY
    ): Promise<ethers.Contract> {
        const initialSupply = ethers.utils.parseUnits(String(mintAmount), 18)
        const ownerAddress = await this.signer.getAddress()
        const tx = await this.contracts.tokenFactory.createToken(
            this.name,
            this.getTokenSymbol(),
            initialSupply,
            ownerAddress
        )

        const receipt = await tx.wait()

        const tokenCreatedEvent = receipt.events?.find(
            (event) =>
                event.event === 'tokenCreated' &&
                event.args[1].toString() === ownerAddress
        )

        if (!tokenCreatedEvent) {
            throw new Error('Token creation event not found')
        }

        const tokenAddress = tokenCreatedEvent.args[0]

        return new ethers.Contract(
            tokenAddress,
            SimpleTokenABI.abi,
            this.signer
        )
    }

    getTokenSymbol() {
        const kindSliced = this.kind.toUpperCase().substring(0, 3)
        const hashSliced = this.hash.toUpperCase().substring(2, 6)
        return `_${kindSliced}${hashSliced}`
    }

    async createPool({
        tokenLeft,
        initialPositions,
        fee
    }: {
        tokenLeft?: Quest
        initialPositions?: any
        fee?: number
    } = {}): Promise<Pool> {
        const tokenLeftContract =
            tokenLeft?.tokenContract || this.getDefaultTokenContract()

        const pool = await Pool.create(
            tokenLeftContract.address,
            this.tokenContract.address,
            fee || Pool.DEFAULT_POOL_FEE,
            this.getApiConfig()
        )
        await pool.deployPool({
            fee: FeeAmount.LOWEST,
            sqrtPrice: encodePriceSqrt(1, 1)
        })

        if (initialPositions) {
            await this.initializePoolPositions(pool, initialPositions)
        }

        return pool
    }

    async initializePoolPositions(pool: Pool, initialPositions) {
        const initialPositionsList =
            initialPositions || TEMP_CONFIG.INITIAL_LIQUIDITY
        for (const positionData of initialPositionsList) {
            await pool.openPosition(
                ''
                // positionData.priceMin,
                // positionData.priceMax,
                // positionData.tokenA,
                // positionData.tokenB
            )
        }
    }

    getDefaultTokenContract(): ethers.Contract {
        return this.defaultToken
    }

    getApiConfig() {
        return {
            provider: this.provider,
            signer: this.signer,
            contracts: this.contracts,
            defaultToken: this.defaultToken
        }
    }
}
