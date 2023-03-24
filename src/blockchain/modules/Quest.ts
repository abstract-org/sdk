import { ethers, Contract } from 'ethers'
import { TUniswapContracts } from '@/blockchain/utils/initializeUniswapContracts'
import { ContractFactory } from 'ethers'
import Hex from 'crypto-js/enc-hex'
import sha256 from 'crypto-js/sha256'
import { SimpleToken, SimpleFactory } from '@/blockchain/typechain-types'
import ERC20_ABI from '@/blockchain/abi/ERC20ABI.json'
import SimpleTokenABI from '@/blockchain/abi/SimpleToken.json'
import { Pool } from '@/blockchain/modules/Pool'

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
    creator_hash: string

    private provider: ethers.providers.JsonRpcProvider
    private signer: ethers.Signer
    private contracts: TUniswapContracts

    static async create(
        name: string,
        kind: string,
        content: string,
        apiConfig: {
            provider: ethers.providers.JsonRpcProvider
            signer: ethers.Signer
            contracts: TUniswapContracts
        }
    ): Promise<Quest> {
        const thisToken = new Quest()
        thisToken.name = name
        thisToken.kind = kind
        thisToken.content = content
        thisToken.hash = Hex.stringify(sha256(name))
        thisToken.provider = apiConfig.provider
        // get it from react-web3 wallet or pre-instantiate from .env PrivateKey
        thisToken.signer = apiConfig.signer
        // pre-defined UniswapV3Contracts
        thisToken.contracts = apiConfig.contracts
        thisToken.creator_hash = await apiConfig.signer.getAddress()

        thisToken.tokenContract = await thisToken.deployToken(20000)

        return thisToken
    }

    async deployToken(mintAmount?: number) {
        return this.deploySimpleToken(mintAmount || DEFAULT_TOTAL_SUPPLY)
    }

    async deploySimpleToken(
        mintAmount: number = DEFAULT_TOTAL_SUPPLY
    ): Promise<ethers.Contract> {
        const SimpleTokenFactory: ContractFactory = new ethers.ContractFactory(
            SimpleTokenABI.abi,
            SimpleTokenABI.bytecode,
            this.signer
        )
        const initialSupply = ethers.utils.parseUnits(String(mintAmount), 18)
        const simpleToken: SimpleToken = <SimpleToken>(
            await SimpleTokenFactory.deploy(
                this.name,
                this.getTokenSymbol(),
                initialSupply,
                this.signer.getAddress()
            )
        )
        await simpleToken.deployed()
        console.log('SimpleToken deployed to:', simpleToken.address)

        return new ethers.Contract(
            simpleToken.address,
            SimpleTokenABI.abi,
            this.signer
        )
    }

    // @deprecated
    async deployERC20Token(
        mintAmount: number = DEFAULT_TOTAL_SUPPLY
    ): Promise<ethers.Contract> {
        const initialSupply = ethers.utils.parseUnits(String(mintAmount), 18)
        const ERC20TokenFactory = new ethers.ContractFactory(
            ERC20_ABI.abi,
            ERC20_ABI.bytecode,
            this.signer
        )
        const ERC20Token = await ERC20TokenFactory.deploy(
            this.getTokenSymbol(),
            initialSupply,
            this.signer.getAddress()
        )
        await ERC20Token.deployTransaction.wait()

        const tokenContract = ERC20Token.connect(this.signer)

        // Mint `supplyAmount` tokens to the signer's address
        const mintTransaction = await tokenContract
            .connect(this.signer)
            .mint(this.signer.getAddress(), initialSupply)
        await mintTransaction.wait()

        console.log(
            '## minted [',
            mintAmount,
            '] tokens to wallet:',
            this.signer.getAddress()
        )

        return tokenContract
    }

    getTokenSymbol() {
        const kindSliced = this.kind.toUpperCase().substring(0, 3)
        const hashSliced = this.hash.toUpperCase().substring(2, 6)
        return `_${kindSliced}${hashSliced}`
    }

    async createPool({
        tokenLeft = null,
        initialPositions = null
    } = {}): Promise<Pool> {
        // like in simulator version const tokenLeftInstance = tokenLeft || new UsdcToken()
        const defaultToken = await this.getDefaultTokenContract()
        const tokenLeftAddress = tokenLeft || defaultToken.getAddress()

        const pool = await Pool.create(
            tokenLeft.getAddress(),
            this.tokenContract.getAddress(),
            this.getApiConfig()
        )

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
                positionData.priceMin,
                positionData.priceMax,
                positionData.tokenA,
                positionData.tokenB
            )
        }
    }

    async getDefaultTokenContract(): Promise<ethers.Contract> {
        return
    }

    getApiConfig() {
        return {
            provider: this.provider,
            signer: this.signer,
            contracts: this.contracts
        }
    }
}
