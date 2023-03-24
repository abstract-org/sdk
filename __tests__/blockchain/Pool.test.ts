import { Pool } from '@/blockchain/modules/Pool'
import { ethers } from 'ethers'
import { initializeUniswapContracts } from '@/blockchain/utils/initializeUniswapContracts'
import dotenv from 'dotenv'
import * as process from 'process'
dotenv.config()

jest.setTimeout(30000)

const token0 = String(process.env.TEST_TOKEN_ADDRESS)
const token1 = String(process.env.WETH_ADDRESS)
const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)

describe('Pool', () => {
    let pool: Pool

    beforeAll(async () => {
        const provider = new ethers.providers.StaticJsonRpcProvider(providerUrl)
        const signer = new ethers.Wallet(privateKey, provider)
        console.log(provider.connection)
        // console.log(await signer.getChainId())
        const nw = await provider.getBalance(signer.address)
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
        const deployParams = {
            fee: 3000,
            deployGasLimit: 500000
        }

        const poolAddress = await pool.deployPool(deployParams)
        expect(poolAddress).toBeDefined()
        expect(pool.poolContractAddress).toBe(poolAddress)
    })

    test('addPosition() should add a new position to the pool', async () => {
        await expect(pool.addPosition()).resolves.not.toThrow()
    })

    test('getPool() should get the pool address', async () => {
        const fee = 3000
        const poolAddress = await pool.getPool(token0, token1, fee)
        expect(poolAddress).toBeDefined()
        expect(poolAddress).toBe(pool.poolContractAddress)
    })

    test('getPool() should throw an error if the pool is not found', async () => {
        const invalidToken = '0xInvalidTokenAddress'
        const fee = 3000
        await expect(pool.getPool(invalidToken, token1, fee)).rejects.toThrow(
            'Pool not found'
        )
    })

    test('swap() should perform a swap between token0 and token1', async () => {
        const amount = 0.1
        await expect(pool.swap(amount)).resolves.not.toThrow()
    })
})
