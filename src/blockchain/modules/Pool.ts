import { BigNumber, ethers } from 'ethers'
import {
    Position as UniswapV3Position,
    Pool as UniswapV3Pool,
    nearestUsableTick,
    FeeAmount,
    TickMath,
    FullMath
} from '@uniswap/v3-sdk'
import JSBI from 'jsbi'
import { encodePriceSqrt } from '@/blockchain/utils/encodedPriceSqrt'
import { Percent, Token as UniswapV3Token } from '@uniswap/sdk-core'
import TokenAbi from '@/blockchain/abi/SimpleToken.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { TUniswapContracts } from '@/blockchain/utils/initializeUniswapContracts'
import { Web3ApiConfig } from '@/api/web3/Web3API'
import { estimateGasAmount } from '@/blockchain/utils/estimateGasAmount'
import { addressComparator } from '@/blockchain/utils/addressComparator'

export const DEFAULT_TX_GAS_LIMIT = 10000000
export const DEFAULT_POOL_FEE = FeeAmount.LOW
export type TDeployParams = {
    fee: number
    sqrtPrice: BigNumber
    deployGasLimit?: number | string
}

export class Pool {
    token0: string
    token1: string
    fee: number
    hash: string
    isReversed: boolean
    poolContract: ethers.Contract = null
    private provider: ethers.providers.JsonRpcProvider
    private signer: ethers.Signer
    private contracts: TUniswapContracts & { tokenFactory: ethers.Contract }

    baseNonce: number
    nonceOffset: number = 0
    static DEFAULT_POOL_FEE: number = FeeAmount.LOW

    constructor() {}

    /**
     * @description builds instance of this class (Pool entity)
     * @example import Pool from '@/blockchain/Pool;
     *          const someNewPool = Pool.create(t0address,t1address,apiConfig)
     *          someNewPool.deployPool()
     */
    static async create(
        token0: string,
        token1: string,
        fee: number,
        apiConfig: Web3ApiConfig
    ): Promise<Pool> {
        const thisPool = new Pool()
        // let's rely on pre-configured with blockchain network instance of caller API (new ethers.providers.JsonRpcProvider(providerUrl))
        thisPool.provider = apiConfig.provider
        // get it from react-web3 wallet or pre-instantiate from .env PrivateKey
        thisPool.signer = apiConfig.signer
        // pre-defined UniswapV3Contracts
        thisPool.contracts = apiConfig.contracts
        const [left, right] = [token0, token1].sort(addressComparator)

        thisPool.isReversed = left !== token0

        thisPool.token0 = left
        thisPool.token1 = right
        thisPool.fee = fee
        const token0Bytes = ethers.utils.arrayify(token0)
        const token1Bytes = ethers.utils.arrayify(token1)
        const concatenatedBytes = ethers.utils.concat([
            token0Bytes,
            token1Bytes
        ])
        thisPool.hash = ethers.utils.sha256(concatenatedBytes)

        return thisPool
    }

    static formatPath(path: string[], fees: FeeAmount[]) {
        const ADDR_SIZE = 20
        const FEE_SIZE = 3
        const OFFSET = ADDR_SIZE + FEE_SIZE
        const DATA_SIZE = OFFSET + ADDR_SIZE

        if (path.length != fees.length + 1) {
            throw new Error('path/fee lengths do not match')
        }

        let encoded = '0x'
        for (let i = 0; i < fees.length; i++) {
            // 20 byte encoding of the address
            encoded += path[i].slice(2)
            // 3 byte encoding of the fee
            encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
        }
        // encode the final token
        encoded += path[path.length - 1].slice(2)

        return encoded.toLowerCase()
    }

    initPoolContract(contractAddress: string) {
        this.poolContract = new ethers.Contract(
            contractAddress,
            IUniswapV3PoolABI.abi,
            this.signer
        )
    }

    async isDeployed() {
        const existingPoolAddress = await this.contracts.factory
            .connect(this.signer)
            .getPool(this.token0, this.token1, this.fee)
        const isDeployed = existingPoolAddress !== ethers.constants.AddressZero

        return {
            existingPoolAddress,
            isDeployed
        }
    }

    async deployPool(params: TDeployParams) {
        const fee = params.fee || Pool.DEFAULT_POOL_FEE
        const gasLimit = params.deployGasLimit || DEFAULT_TX_GAS_LIMIT
        const { factory, positionManager } = this.contracts

        let poolAddress

        const createPoolParams = [
            this.token0,
            this.token1,
            fee,
            params.sqrtPrice
        ]

        await estimateGasAmount(
            this.provider,
            positionManager,
            'createAndInitializePoolIfNecessary',
            ...createPoolParams
        )

        const tx = await positionManager
            .connect(this.signer)
            .createAndInitializePoolIfNecessary(...createPoolParams, {
                gasLimit
            })

        await tx.wait()

        poolAddress = await factory
            .connect(this.signer)
            .getPool(this.token0, this.token1, fee)

        this.initPoolContract(poolAddress)
    }

    async openSingleSidedPosition(
        amount: string,
        priceTick: number,
        side: 'token0' | 'token1'
    ) {
        const mintParams = await this.getSingleSidedMintParams(
            amount,
            priceTick,
            side
        )

        await estimateGasAmount(
            this.provider,
            this.contracts.positionManager,
            'mint',
            mintParams
        )

        const positionMintTx = await this.contracts.positionManager
            .connect(await this.signer)
            .mint(mintParams, {
                gasLimit: ethers.utils.hexlify(1000000)
            })

        await positionMintTx.wait()
    }

    async openPositionFromAmounts(
        amount0: string,
        amount1: string,
        priceTick?: number
    ) {
        const mintParams = await this.getAmountsMintParams(
            amount0,
            amount1,
            priceTick
        )

        await estimateGasAmount(
            this.provider,
            this.contracts.positionManager,
            'mint',
            mintParams
        )

        const positionMintTx = await this.contracts.positionManager
            .connect(await this.signer)
            .mint(mintParams, {
                gasLimit: ethers.utils.hexlify(1000000)
            })

        await positionMintTx.wait()
    }

    async openPosition(liquidityAmount: string, priceTick?: number) {
        const mintParams = await this.getPositionMintParams(
            liquidityAmount,
            priceTick
        )

        await estimateGasAmount(
            this.provider,
            this.contracts.positionManager,
            'mint',
            mintParams
        )

        const positionMintTx = await this.contracts.positionManager
            .connect(await this.signer)
            .mint(mintParams, {
                gasLimit: ethers.utils.hexlify(1000000)
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

    async swapExactInputPath(amount: string, path: string[], fees: number[]) {
        await this.approveRouter()

        const amountIn = ethers.utils.parseEther(amount).toString()

        const formattedPath = Pool.formatPath(path, fees)

        const quotedAmountOut =
            await this.contracts.quoter.callStatic.quoteExactInput(
                formattedPath,
                amountIn,
                0
            )

        const swapParams = {
            path: formattedPath,
            recipient: await this.signer.getAddress(),
            deadline: Math.floor(Date.now() / 1000) * 60,
            amountIn: amountIn,
            amountOutMinimum: quotedAmountOut.toString()
        }

        await estimateGasAmount(
            this.provider,
            this.contracts.router,
            'exactInput',
            swapParams
        )

        await this.contracts.router
            .connect(this.signer)
            .exactInput(swapParams, {
                gasLimit: ethers.utils.hexlify(3000000)
            })
    }

    async swapExactInputSingle(amount: string, direct: boolean = true) {
        // approving spending gas for router
        await this.approveRouter()

        const poolImmutables = await this.getPoolImmutables()
        const amountIn = ethers.utils.parseEther(amount).toString()

        // calc param amountOutMinimum
        const quotedAmountOut =
            await this.contracts.quoter.callStatic.quoteExactInputSingle(
                direct ? poolImmutables.token0 : poolImmutables.token1,
                direct ? poolImmutables.token1 : poolImmutables.token0,
                poolImmutables.fee,
                amountIn,
                0
            )

        const swapParams = {
            tokenIn: direct ? poolImmutables.token0 : poolImmutables.token1,
            tokenOut: direct ? poolImmutables.token1 : poolImmutables.token0,
            fee: poolImmutables.fee,
            recipient: await this.signer.getAddress(),
            deadline: Math.floor(Date.now() / 1000) * 60,
            amountIn: amountIn,
            amountOutMinimum: quotedAmountOut.toString(), // shouldn't be 0 in production
            sqrtPriceLimitX96: 0 // TODO: shouldn't be 0 in production
        }

        await estimateGasAmount(
            this.provider,
            this.contracts.router,
            'exactInputSingle',
            swapParams
        )

        await this.contracts.router
            .connect(this.signer)
            .exactInputSingle(swapParams, {
                gasLimit: ethers.utils.hexlify(3000000)
            })
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

    async tickToPrice() {}

    async priceFromTick(tick: number, inputAmount: number, decimals: number) {
        const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)
        const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96)
        const baseAmount = JSBI.BigInt(inputAmount * 10 ** decimals)
        const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192))

        const quoteAmount = FullMath.mulDivRoundingUp(
            ratioX192,
            baseAmount,
            shift
        )

        // console.log(quoteAmount.toString() / (10**decimals));
    }

    async approveRouter() {
        const approvalAmount = ethers.utils.parseUnits('1000', 18).toString()
        const token0approveTx = await this.getToken0Contract()
            .connect(this.signer)
            .approve(this.contracts.router.address, approvalAmount)
        const token1approveTx = await this.getToken1Contract()
            .connect(this.signer)
            .approve(this.contracts.router.address, approvalAmount)
        await Promise.all([token0approveTx.wait(), token1approveTx.wait()])
    }

    async approvePositionManager() {
        const approvalAmount = ethers.utils.parseUnits('1000', 18).toString()
        const token0approveTx = await this.getToken0Contract()
            .connect(this.signer)
            .approve(this.contracts.positionManager.address, approvalAmount)
        const token1approveTx = await this.getToken1Contract()
            .connect(this.signer)
            .approve(this.contracts.positionManager.address, approvalAmount)
        await Promise.all([token0approveTx.wait(), token1approveTx.wait()])
    }

    async getAmountsMintParams(
        amount0: string,
        amount1: string,
        positionTick?: number
    ) {
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

        const usableTick = positionTick ? positionTick : tick
        const tickLower =
            nearestUsableTick(usableTick, tickSpacing) - tickSpacing * 2
        const tickUpper =
            nearestUsableTick(usableTick, tickSpacing) + tickSpacing * 2

        const basePositionParams = {
            pool: tokensPool,
            tickLower,
            tickUpper,
            useFullPrecision: true
        }

        return UniswapV3Position.fromAmounts({
            ...basePositionParams,
            amount0: ethers.utils.parseEther(amount0).toString(),
            amount1: ethers.utils.parseEther(amount1).toString()
        })
    }

    async getSingleSidedMintParams(
        amount: string,
        positionTick: number,
        side: 'token0' | 'token1'
    ) {
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

        const usableTick = positionTick ? positionTick : tick
        const tickLower =
            nearestUsableTick(usableTick, tickSpacing) - tickSpacing * 2
        const tickUpper =
            nearestUsableTick(usableTick, tickSpacing) + tickSpacing * 2

        const basePositionParams = {
            pool: tokensPool,
            tickLower,
            tickUpper,
            useFullPrecision: true
        }

        const position =
            side === 'token0'
                ? UniswapV3Position.fromAmount0({
                      ...basePositionParams,
                      amount0: ethers.utils.parseEther(amount).toString()
                  })
                : UniswapV3Position.fromAmount1({
                      ...basePositionParams,
                      amount1: ethers.utils.parseEther(amount).toString()
                  })

        await this.approvePositionManager()

        const { amount0: amount0Desired, amount1: amount1Desired } =
            position.mintAmounts

        // const { amount0: amount0Min, amount1: amount1Min } =
        //     position.mintAmountsWithSlippage(new Percent(50, 10_000))

        const params = {
            token0: this.token0,
            token1: this.token1,
            fee,
            tickLower,
            tickUpper,
            amount0Desired: amount0Desired.toString(),
            amount1Desired: amount1Desired.toString(),
            amount0Min: 0,
            amount1Min: 0,
            recipient: await this.signer.getAddress(),
            deadline: Math.floor(Date.now() / 1000) * 60
        }
        console.log('positionMintParamsSingleSided:', params)

        return params
    }

    async getPositionMintParams(
        positionLiquidityAmount: string,
        positionTick?: number
    ) {
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

        const usableTick = positionTick ? positionTick : tick
        const tickLower =
            nearestUsableTick(usableTick, tickSpacing) - tickSpacing * 2
        const tickUpper =
            nearestUsableTick(usableTick, tickSpacing) + tickSpacing * 2

        const position = new UniswapV3Position({
            pool: tokensPool,
            liquidity: ethers.utils
                .parseEther(positionLiquidityAmount)
                .toString(), // TODO: check if auto-cast to BigintIsh works fine
            tickLower,
            tickUpper
        })

        await this.approvePositionManager()

        const { amount0: amount0Desired, amount1: amount1Desired } =
            position.mintAmounts

        // const { amount0: amount0Min, amount1: amount1Min } =
        //     position.mintAmountsWithSlippage(new Percent(50, 10_000))

        const params = {
            token0: this.token0,
            token1: this.token1,
            fee,
            tickLower,
            tickUpper,
            amount0Desired: amount0Desired.toString(),
            amount1Desired: amount1Desired.toString(),
            amount0Min: 0,
            amount1Min: 0,
            recipient: await this.signer.getAddress(),
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
        const result = this.baseNonce + this.nonceOffset

        this.nonceOffset += 1

        return result
    }
}
