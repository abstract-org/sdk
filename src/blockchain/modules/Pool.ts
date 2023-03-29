import { BigNumber, ethers } from 'ethers'
import {
    Position as UniswapV3Position,
    Pool as UniswapV3Pool,
    nearestUsableTick,
    FeeAmount
} from '@uniswap/v3-sdk'
import { encodePriceSqrt } from '@/blockchain/utils/encodedPriceSqrt'
import { Percent, Token as UniswapV3Token } from '@uniswap/sdk-core'
import TokenAbi from '@/blockchain/abi/SimpleToken.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { TUniswapContracts } from '@/blockchain/utils/initializeUniswapContracts'
import { Web3ApiConfig } from '@/api/web3/Web3API'
import { NonceManager } from "@ethersproject/experimental";

export const DEFAULT_TX_GAS_LIMIT = 10000000
export const DEFAULT_POOL_FEE = FeeAmount.LOW
export type TDeployParams = {
    fee: number;
    sqrtPrice: BigNumber;
    deployGasLimit?: number;
}

export class Pool {
    token0: string
    token1: string
    hash: string
    poolContract: ethers.Contract = null
    private provider: ethers.providers.JsonRpcProvider
    private signer: ethers.Signer
    private contracts: TUniswapContracts

    baseNonce: number
    nonceOffset: number = 0

    constructor() {
    }

    /**
     * @description builds instance of this class (Pool entity)
     * @example import Pool from '@/blockchain/Pool;
     *          const someNewPool = Pool.create(t0address,t1address,apiConfig)
     *          someNewPool.deployPool()
     */
    static async create(
        token0: string,
        token1: string,
        apiConfig: Web3ApiConfig
    ): Promise<Pool> {
        const thisPool = new Pool()
        // let's rely on pre-configured with blockchain network instance of caller API (new ethers.providers.JsonRpcProvider(providerUrl))
        thisPool.provider = apiConfig.provider
        // get it from react-web3 wallet or pre-instantiate from .env PrivateKey
        thisPool.signer = apiConfig.signer
        // pre-defined UniswapV3Contracts
        thisPool.contracts = apiConfig.contracts

        thisPool.token0 = token0
        thisPool.token1 = token1
        const token0Bytes = ethers.utils.arrayify(token0)
        const token1Bytes = ethers.utils.arrayify(token1)
        const concatenatedBytes = ethers.utils.concat([
            token0Bytes,
            token1Bytes
        ])
        thisPool.hash = ethers.utils.sha256(concatenatedBytes)

        return thisPool
    }

    async deployPool(params: TDeployParams): Promise<ethers.Contract> {
        const nonce = await this.provider.getTransactionCount(await this.signer.getAddress());
        const deployer = this.signer
        const fee = params.fee || DEFAULT_POOL_FEE
        const gasLimit = params.deployGasLimit || DEFAULT_TX_GAS_LIMIT
        const factory = this.contracts.factory
        const positionManager = this.contracts.positionManager

        const existingPoolAddress = await factory
            .connect(deployer)
            .getPool(this.token0, this.token1, fee)

        let poolAddress
        if (existingPoolAddress === ethers.constants.AddressZero) {
            const tx = await positionManager
                .connect(deployer)
                .createAndInitializePoolIfNecessary(
                    this.token0,
                    this.token1,
                    fee,
                    params.sqrtPrice,
                    { gasLimit, nonce: nonce + 1 }
                )

            await tx.wait()

            poolAddress = await factory
                .connect(deployer)
                .getPool(this.token0, this.token1, fee, {
                    gasLimit: ethers.utils.hexlify(1000000),
                    nonce: nonce + 1
                })
        } else {
            poolAddress = existingPoolAddress
        }

        console.log('## Pool deployed on address:', poolAddress)
        const poolContract = new ethers.Contract(
            poolAddress,
            IUniswapV3PoolABI.abi,
            this.signer
        )

        this.poolContract = poolContract

        return poolContract
    }

    async openPosition(liquidityAmount: string) {
        const nonce = await this.provider.getTransactionCount(await this.signer.getAddress());
        console.log('openPosition:  ', nonce)

        const mintParams = await this.getPositionMintParams(liquidityAmount)

        const positionMintTx = await this.contracts.positionManager
            .connect(this.signer)
            .mint(mintParams, {
                gasLimit: ethers.utils.hexlify(1000000),
                nonce: nonce + 2
            })

        await positionMintTx.wait() // expect positionManager emit event 'IncreaseLiquidity' after positionMintTx
    }

    // fetches existing v3 UniswapV3pool getPool and returns it's contract
    async getPoolContract(
        token0: string,
        token1: string,
        fee: number
    ): Promise<ethers.Contract> {
        const token0Address = ethers.utils.getAddress(token0)
        const token1Address = ethers.utils.getAddress(token1)

        const uniswapFactory = await this.contracts.factory.connect(this.signer)
        const poolAddress = await uniswapFactory.getPool(
            token0Address,
            token1Address,
            fee
        )

        if (poolAddress === ethers.constants.AddressZero) {
            throw new Error('Pool not found')
        }

        return poolAddress
    }

    async swap(amount, native: boolean = false) {
        // approving spending gas for router
        const approvalAmount = ethers.utils.parseUnits('1000', 18).toString()
        await Promise.all([
            this.getToken0Contract()
                .connect(this.signer)
                .approve(this.contracts.router.address, approvalAmount),
            this.getToken1Contract()
                .connect(this.signer)
                .approve(this.contracts.router.address, approvalAmount)
        ])

        const poolImmutables = await this.getPoolImmutables()
        const amountIn = ethers.utils.parseUnits(String(amount), 18).toString()

        // calc param amountOutMinimum
        const quotedAmountOut =
            await this.contracts.quoter.callStatic.quoteExactInputSingle(
                poolImmutables.token0,
                poolImmutables.token1,
                poolImmutables.fee,
                amountIn,
                0
            )
        const swapParams = {
            tokenIn: poolImmutables.token0,
            tokenOut: poolImmutables.token1,
            fee: poolImmutables.fee,
            recipient: this.signer.getAddress(),
            deadline: Math.floor(Date.now() / 1000) * 60,
            amountIn: amountIn,
            amountOutMinimum: quotedAmountOut.toString(), // shouldn't be 0 in production
            sqrtPriceLimitX96: 0 // TODO: shouldn't be 0 in production
        }

        console.debug(
            '--- pool.liquidity before swap:',
            await this.poolContract.liquidity()
        )
        await this.contracts.router
            .connect(this.signer)
            .exactInputSingle(swapParams, {
                gasLimit: ethers.utils.hexlify(5000000)
            })

        console.debug(
            '--- pool.liquidity after swap:',
            await this.poolContract.liquidity()
        )
    }

    // async swapExactInput(
    //     tokenIn: string,
    //     tokenOut: string,
    //     fee: number,
    //     recipient: string,
    //     amountIn: ethers.BigNumber,
    //     amountOutMinimum: ethers.BigNumber,
    //     deadline: number
    // ): Promise<ethers.ContractTransaction> {
    //     const poolAddress = await this.getPool(tokenIn, tokenOut, fee)
    //     const swapRouter = this.contracts.router
    //
    //     const path = [tokenIn, tokenOut]
    //     const amountOutMinimumF18 = ethers.utils.parseUnits(
    //         amountOutMinimum.toString(),
    //         18
    //     )
    //
    //     const tx = await swapRouter.exactInputSingle({
    //         tokenIn: path[0],
    //         tokenOut: path[path.length - 1],
    //         fee: fee,
    //         recipient: recipient,
    //         deadline: deadline,
    //         amountIn: amountIn,
    //         amountOutMinimum: amountOutMinimumF18,
    //         sqrtPriceLimitX96: 0
    //     })
    //
    //     return tx
    // }

    async getPoolStateData() {
        const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
            this.poolContract.tickSpacing(),
            this.poolContract.fee(),
            this.poolContract.liquidity(),
            this.poolContract.slot0()
        ])

        return {
            tickSpacing,
            fee,
            liquidity,
            sqrtPriceX96: slot0[0],
            tick: slot0[1]
        }
    }

    async getPoolImmutables() {
        const [token0, token1, fee] = await Promise.all([
            this.poolContract.token0(),
            this.poolContract.token1(),
            this.poolContract.fee()
        ])

        return {
            token0,
            token1,
            fee
        }
    }

    async getPositionMintParams(positionLiquidityAmount: string) {
        const poolData = await this.getPoolStateData()
        const { tick, tickSpacing, fee, liquidity, sqrtPriceX96 } = poolData

        const token0Instance = await this.constructUniswapV3token(this.token0)
        const token1Instance = await this.constructUniswapV3token(this.token1)
        const tokensPool = new UniswapV3Pool(
            token0Instance,
            token1Instance,
            fee,
            sqrtPriceX96.toString(),
            liquidity.toString(),
            tick
        )

        const tickLower = nearestUsableTick(tick, tickSpacing) - tickSpacing * 2
        const tickUpper = nearestUsableTick(tick, tickSpacing) + tickSpacing * 2
        const position = new UniswapV3Position({
            pool: tokensPool,
            liquidity: ethers.utils.parseEther(positionLiquidityAmount).toString(), // TODO: check if auto-cast to BigintIsh works fine
            tickLower,
            tickUpper
        })

        const approvalAmount = ethers.utils.parseUnits('1000', 18).toString()
        const token0approveTx = await this.getToken0Contract()
            .connect(this.signer)
            .approve(this.contracts.positionManager.address, approvalAmount)
        const token1approveTx = await this.getToken1Contract()
            .connect(this.signer)
            .approve(this.contracts.positionManager.address, approvalAmount)
        await Promise.all([token0approveTx.wait(), token1approveTx.wait()])

        const { amount0: amount0Desired, amount1: amount1Desired } =
            position.mintAmounts

        const { amount0: amount0Min, amount1: amount1Min } =
            position.mintAmountsWithSlippage(new Percent(50, 10_000))

        const params = {
            token0: this.token0,
            token1: this.token1,
            fee,
            tickLower,
            tickUpper,
            amount0Desired: amount0Desired.toString(),
            amount1Desired: amount1Desired.toString(),
            amount0Min: amount0Min.toString(),
            amount1Min: amount1Min.toString(),
            recipient: this.signer.getAddress(),
            deadline: Math.floor(Date.now() / 1000) * 60
        }
        console.log('positionMintParams:', params)

        return params
    }

    constructTokenContract(tokenAddress, tokenAbi = TokenAbi.abi) {
        return new ethers.Contract(tokenAddress, tokenAbi, this.signer)
    }

    getToken0Contract() {
        return this.constructTokenContract(this.token0)
    }

    getToken1Contract() {
        return this.constructTokenContract(this.token1)
    }

    async constructUniswapV3token(tokenAddress: string) {
        const network = await this.provider.getNetwork()
        const tokenContract = this.constructTokenContract(tokenAddress)
        const [decimals, symbol, name] = await Promise.all([
            tokenContract.connect(this.signer).decimals(),
            tokenContract.connect(this.signer).symbol(),
            tokenContract.connect(this.signer).name()
        ])

        return new UniswapV3Token(
            network.chainId,
            tokenAddress,
            decimals,
            symbol,
            name
        )
    }

    getNonce() {
        const result = this.baseNonce + this.nonceOffset;

        this.nonceOffset += 1;

        return result;
    }
}
