import { Pool } from '@/blockchain/modules/Pool'
import { ethers } from 'ethers'
import { initializeUniswapContracts } from '@/blockchain/utils/initializeUniswapContracts'
import dotenv from 'dotenv'
import { encodePriceSqrt } from '@/blockchain/utils/encodedPriceSqrt'

dotenv.config()

const token0 = String(process.env.TEST_TOKEN_ADDRESS)
const token1 = String(process.env.WETH_ADDRESS)
const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)

describe('blockchain Pool entity', () => {
    let pool: Pool

    beforeAll(async () => {
        const provider = new ethers.providers.StaticJsonRpcProvider(providerUrl)
        const signer = new ethers.Wallet(privateKey, provider)
        const contracts = initializeUniswapContracts(signer)
        pool = await Pool.create(token0, token1, {
            provider,
            signer,
            contracts
        })
    })

    test('create() should create a new Pool instance', async () => {
        expect(pool).toBeInstanceOf(Pool)
        expect(pool.token0).toBe(token0)
        expect(pool.token1).toBe(token1)
    })

    test('deployPool() should deploy a new pool or return an existing one', async () => {
        const fee = 500
        await pool.deployPool({
            fee,
            sqrtPrice: encodePriceSqrt(1, 1)
        })

        const poolImmutables = await pool.getPoolImmutables()

        expect(pool.poolContract.address).toBeDefined()
        expect(poolImmutables.token0).toBe(pool.token0)
        expect(poolImmutables.token1).toBe(pool.token1)
        expect(poolImmutables.fee).toBe(fee)
    })

    test('openPosition() should add a new position to the pool', async () => {
        await pool.openPosition('0.1');
    })

    test('getPool() should get the pool address', async () => {
        const fee = 500
        const poolAddress = await pool.getPoolContract(token0, token1, fee)
        expect(poolAddress).toBeDefined()
        expect(poolAddress).toBe(pool.poolContract.address)
    })

    test('getPool() should throw an error if the pool is not found', async () => {
        const invalidToken = ethers.constants.AddressZero
        const fee = 3000
        await expect(
            pool.getPoolContract(invalidToken, token1, fee)
        ).rejects.toThrow('Pool not found')
    })

    test('swap() should perform a swap between token0 and token1', async () => {
        const amount = '0.1'
        await expect(pool.swap(amount)).resolves.not.toThrow()
    })
})
