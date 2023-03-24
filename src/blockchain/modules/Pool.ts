import { ethers } from 'ethers'
import {
    Position as UniswapV3Position,
    Pool as UniswapV3Pool,
    nearestUsableTick
} from '@uniswap/v3-sdk'
import { encodePriceSqrt } from '@/blockchain/utils/encodedPriceSqrt'
import { Percent, Token as UniswapV3Token } from '@uniswap/sdk-core'
import TokenAbi from '@/blockchain/abi/SimpleToken.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { TUniswapContracts } from '@/blockchain/utils/initializeUniswapContracts'

export const DEFAULT_TX_GAS_LIMIT = 100000000 // 0.1 GWei

export type TDeployParams = {
    fee: number
    deployGasLimit?: number
}

export class Pool {
    private provider: ethers.providers.JsonRpcProvider
    private signer: ethers.Signer
    private contracts: TUniswapContracts

    public token0: string
    public token1: string
    public hash: string
    poolContractAddress?: string
    constructor() {}

    // builds instance of this class (Pool entity)

    /**
     * @description builds instance of this class (Pool entity)
     * @example import Pool from '@/blockchain/Pool;
     *          const someNewPool = Pool.create(t0,t1,apiConfig)
     *          someNewPool.deployPool()
     */
    static async create(
        token0,
        token1,
        apiConfig: {
            provider: ethers.providers.JsonRpcProvider
            signer: ethers.Signer
            contracts: TUniswapContracts
        }
    ): Promise<Pool> {
        const pool = new Pool()
        // let's rely on pre-configured with blockchain network instance of caller API (new ethers.providers.JsonRpcProvider(providerUrl))
        pool.provider = apiConfig.provider

        // get it from react-web3 wallet or pre-instantiate from .env PrivateKey
        pool.signer = apiConfig.signer

        // pre-defined UniswapV3Contracts
        pool.contracts = apiConfig.contracts

        pool.token0 = token0
        pool.token1 = token1
        const token0Bytes = ethers.utils.arrayify(token0)
        const token1Bytes = ethers.utils.arrayify(token1)
        const concatenatedBytes = ethers.utils.concat([
            token0Bytes,
            token1Bytes
        ])
        pool.hash = ethers.utils.sha256(concatenatedBytes)
        // pool.deployPool()
        return pool
    }

    async deployPool(params: TDeployParams): Promise<string> {
        const deployer = this.signer
        const sqrtPrice = encodePriceSqrt(1, 1)
        const fee = params.fee
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
                    sqrtPrice,
                    {
                        gasLimit: params.deployGasLimit || DEFAULT_TX_GAS_LIMIT
                    }
                )

            await tx.wait()

            poolAddress = await factory
                .connect(deployer)
                .getPool(this.token0, this.token1, fee, {
                    gasLimit: ethers.utils.hexlify(1000000)
                })
        } else {
            poolAddress = existingPoolAddress
        }

        console.log('## Pool deployed on address:', poolAddress)
        this.poolContractAddress = poolAddress

        return poolAddress
    }

    async addPosition() {
        const pool = new ethers.Contract(
            this.poolContractAddress,
            IUniswapV3PoolABI.abi,
            this.signer
        )

        const mintParams = await this.getPositionMintParams(pool)
        const positionMintTx = await this.contracts.positionManager
            .connect(this.signer)
            .mint(mintParams, {
                gasLimit: ethers.utils.hexlify(1000000)
            })

        // await expect(positionMintTx).to.emit(UniswapContracts.positionManager, 'IncreaseLiquidity');
    }

    // fetches existing v3 UniswapV3pool getPool and returns it's address
    async getPool(
        token0: string,
        token1: string,
        fee: number
    ): Promise<string> {
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

    async swap(amount) {
        const pool = new ethers.Contract(
            String(process.env.WETH_TEST_TOKEN_POOL_ADDRESS),
            IUniswapV3PoolABI.abi,
            this.signer
        )

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

        const poolImmutables = await Pool.getPoolImmutables(pool)
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

        console.debug('--- pool.liquidity before swap:', await pool.liquidity())
        await this.contracts.router
            .connect(this.signer)
            .exactInputSingle(swapParams, {
                gasLimit: ethers.utils.hexlify(5000000)
            })

        console.debug('--- pool.liquidity after swap:', await pool.liquidity())
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

    static async getPoolStateData(pool) {
        const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
            pool.tickSpacing(),
            pool.fee(),
            pool.liquidity(),
            pool.slot0()
        ])

        return {
            tickSpacing,
            fee,
            liquidity,
            sqrtPriceX96: slot0[0],
            tick: slot0[1]
        }
    }

    static async getPoolImmutables(pool) {
        const [token0, token1, fee] = await Promise.all([
            pool.token0(),
            pool.token1(),
            pool.fee()
        ])

        return {
            token0,
            token1,
            fee
        }
    }

    async getPositionMintParams(pool) {
        const poolData = await Pool.getPoolStateData(pool)
        const poolImmutables = await Pool.getPoolImmutables(pool)
        const { tick, tickSpacing, fee, liquidity, sqrtPriceX96 } = poolData
        const network = await this.provider.getNetwork()

        const token0Instance = new UniswapV3Token(
            network.chainId,
            poolImmutables.token0,
            await this.getToken0Contract().connect(this.signer).decimals(),
            await this.getToken0Contract().connect(this.signer).symbol(),
            await this.getToken0Contract().connect(this.signer).name()
        )
        const token1Instance = new UniswapV3Token(
            network.chainId,
            poolImmutables.token1,
            await this.getToken1Contract().connect(this.signer).decimals(),
            await this.getToken1Contract().connect(this.signer).symbol(),
            await this.getToken1Contract().connect(this.signer).name()
        )

        const tokensPool = new UniswapV3Pool(
            token0Instance,
            token1Instance,
            fee,
            sqrtPriceX96.toString(),
            liquidity.toString(),
            tick
        )

        const position = new UniswapV3Position({
            pool: tokensPool,
            liquidity: ethers.utils.parseEther('0.1').toString(), // TODO: check if auto-cast to BigintIsh works fine
            tickLower: nearestUsableTick(tick, tickSpacing) - tickSpacing * 2,
            tickUpper: nearestUsableTick(tick, tickSpacing) + tickSpacing * 2
        })

        const approvalAmount = ethers.utils.parseUnits('1000', 18).toString()

        await Promise.all([
            this.getToken0Contract()
                .connect(this.signer)
                .approve(
                    this.contracts.positionManager.address,
                    approvalAmount
                ),
            this.getToken1Contract()
                .connect(this.signer)
                .approve(this.contracts.positionManager.address, approvalAmount)
        ])

        const { amount0: amount0Desired, amount1: amount1Desired } =
            position.mintAmounts

        const { amount0: amount0Min, amount1: amount1Min } =
            position.mintAmountsWithSlippage(new Percent(50, 10_000))

        const params = {
            token0: this.token0,
            token1: this.token1,
            fee,
            tickLower: nearestUsableTick(tick, tickSpacing) - tickSpacing * 2,
            tickUpper: nearestUsableTick(tick, tickSpacing) + tickSpacing * 2,
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

    getToken0Contract() {
        return new ethers.Contract(this.token0, TokenAbi.abi, this.signer)
    }

    getToken1Contract() {
        return new ethers.Contract(this.token1, TokenAbi.abi, this.signer)
    }
}

// method which deploys Uniswap v3 Pool if it does not exist yet on blockchain
// async _bad_deployPool1(fee: number, tickSpacing: number): Promise<string> {
//     const token0Address = this.token0
//     const token1Address = this.token1
//
//     const tx = await this.contracts.UniswapV3Factory.connect(
//         this.signer
//     ).createPool(token0Address, token1Address, fee)
//
//     const receipt = await tx.wait()
//     const event = receipt.events?.find((e) => e.event === 'PoolCreated')
//
//     if (!event) {
//         throw new Error('Failed to create UniswapV3pool')
//     }
//
//     const poolAddress = event.args?.UniswapV3pool
//     if (!poolAddress) {
//         throw new Error('Pool address not found')
//     }
//
//     const pool = new UniswapV3Pool(
//         token0Address,
//         token1Address,
//         fee,
//         tickSpacing,
//         poolAddress,
//         this.provider
//     )
//     this.UniswapV3pool = pool
//
//     return poolAddress
// }

//openPosition
//swap

// async exactInputSingleSwap(
//     tokenIn: string,
//     tokenOut: string,
//     fee: number,
//     recipient: string,
//     amountIn: ethers.BigNumber,
//     amountOutMinimum: ethers.BigNumber,
//     sqrtPriceLimitX96: ethers.BigNumber
// ): Promise<ethers.ContractTransaction> {

// creates and returns Uniswap v3 position instance
// createPosition(
//     token0: string,
//     token1: string,
//     fee: number,
//     tickLower: number,
//     tickUpper: number,
//     amount0Desired: ethers.BigNumber,
//     amount1Desired: ethers.BigNumber,
//     amount0Min: ethers.BigNumber,
//     amount1Min: ethers.BigNumber,
//     recipient: string
// ): UniswapV3Position {
//     const token0Address = ethers.utils.getAddress(token0)
//     const token1Address = ethers.utils.getAddress(token1)
//     const tickSpacing = TickMath.getTickSpacing()
//
//     if (!this.UniswapV3pool) {
//         throw new Error('Pool instance not created yet')
//     }
//
//     const position = UniswapV3Token.fromAmounts(
//         this.UniswapV3pool,
//         amount0Desired,
//         amount1Desired,
//         tickLower,
//         tickUpper
//     )
//
//     return position
// }
