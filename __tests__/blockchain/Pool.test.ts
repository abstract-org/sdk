import {Pool} from '@/blockchain/modules/Pool'
import {ethers} from 'ethers'
import {initializeUniswapContracts} from '@/blockchain/utils/initializeUniswapContracts'
import dotenv from 'dotenv'
import {encodePriceSqrt} from '@/blockchain/utils/encodedPriceSqrt'
import {nearestUsableTick} from '@uniswap/v3-sdk'
import {initializeTokenFactory} from '@/blockchain/utils/initializeTokenFactory'
import {initializeDefaultToken} from '@/blockchain/utils/initializeDefaultToken'

dotenv.config()

const token0 = String(process.env.WETH_ADDRESS)
const token1 = String(process.env.TEST_TOKEN_ADDRESS)
const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)

describe('blockchain Pool entity', () => {
    let provider: any
    let signer: any
    let pool: Pool
    let wethContract: ethers.Contract
    let testTokenContract: ethers.Contract

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(providerUrl)
        const wallet = new ethers.Wallet(privateKey, provider)
        signer = wallet.connect(provider)
        wethContract = new ethers.Contract(
            token0,
            ['function balanceOf(address) external view returns (uint256)'],
            signer
        )
        testTokenContract = new ethers.Contract(
            token1,
            ['function balanceOf(address) external view returns (uint256)'],
            signer
        )
        pool = await Pool.create(token0, token1, 500, {
            provider,
            signer,
            contracts: {
                ...initializeUniswapContracts(signer),
                tokenFactory: initializeTokenFactory(signer)
            },
            defaultToken: initializeDefaultToken(signer)
        });
    })

    test('create() should create a new Pool instance', async () => {
        expect(pool).toBeInstanceOf(Pool)
        expect(pool.token0).toBe(token0)
        expect(pool.token1).toBe(token1)
    })

    test('deployPool() should deploy a new pool or return an existing one', async () => {
        const {isDeployed, existingPoolAddress} = await pool.isDeployed();
        const poolParams = {
            fee: 500,
            sqrtPrice: encodePriceSqrt(10000, 1)
        }

        if (isDeployed) {
            pool.initPoolContract(existingPoolAddress)
        } else {
            console.log('Deploy Pool params: ', poolParams)
            await pool.deployPool(poolParams)
        }

        const poolImmutables = await pool.getPoolImmutables()

        expect(pool.poolContract.address).toBeDefined()
        expect(poolImmutables.token0).toBe(pool.token0)
        expect(poolImmutables.token1).toBe(pool.token1)
        expect(poolImmutables.fee).toBe(poolParams.fee)
    })

    test('openPosition() should add a new position to the pool', async () => {
        const {tick, tickSpacing, sqrtPriceX96} = await pool.getPoolStateData()

        const upperTick = nearestUsableTick(tick, tickSpacing) + tickSpacing * 2
        const lowerTick = nearestUsableTick(tick, tickSpacing) - tickSpacing * 2

        console.log('Current Tick: ', [tick, tickSpacing])
        console.log('Lower/Upper Ticks: ', [lowerTick, upperTick])

        // Should add liquidity on current price
        await pool.openPosition('0.1', tick)

        // Should open position for range upper than current price
        await pool.openPosition('0.5', upperTick)

        // Should open position for range lower than current price
        await pool.openPosition('0.5', lowerTick)
    })

    test('getPool() should get the pool address', async () => {
        const fee = 500
        const poolAddress = await pool.getPoolContract(token0, token1, fee)
        expect(poolAddress).toBeDefined()
        expect(poolAddress).toBe(pool.poolContract.address)
    })

    test.skip('getPool() should throw an error if the pool is not found', async () => {
        const invalidToken = ethers.constants.AddressZero
        const fee = 3000
        await expect(
            pool.getPoolContract(invalidToken, token1, fee)
        ).rejects.toThrow('Pool not found')
    })

    test.skip('swap() should perform a swap between token0 and token1', async () => {
        const amount = '0.1'
        await expect(pool.swap(amount)).resolves.not.toThrow()
    })
})