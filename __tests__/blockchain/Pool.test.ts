import { Pool } from '@/blockchain/modules/Pool'
import { ethers } from 'ethers'
import {
    initializeUniswapContracts,
    TUniswapContracts
} from '@/blockchain/utils/initializeUniswapContracts'
import dotenv from 'dotenv'
import { initializeDefaultToken } from '@/blockchain/utils/initializeDefaultToken'
import { Web3ApiConfig } from '@/api/web3/Web3API'
import { FeeAmount } from '@uniswap/v3-sdk'
import { encodePriceSqrt } from '@/blockchain/utils/encodedPriceSqrt'
import { initializeTokenFactory } from '@/blockchain/utils/initializeTokenFactory'

dotenv.config()

const token0 = String(process.env.TEST_TOKEN_ADDRESS)
const token1 = String(process.env.WETH_ADDRESS)
const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)

describe('blockchain Pool entity', () => {
    let pool: Pool
    let apiConfig: Web3ApiConfig
    const provider = new ethers.providers.StaticJsonRpcProvider(providerUrl)
    const signer = new ethers.Wallet(privateKey, provider)

    beforeAll(async () => {
        apiConfig = {
            provider,
            signer,
            contracts: {
                ...initializeUniswapContracts(signer),
                tokenFactory: initializeTokenFactory(signer)
            },
            defaultToken: initializeDefaultToken(signer)
        }
        pool = await Pool.create(token0, token1, apiConfig)
    })

    describe('create() returns pool', () => {
        test('should be Pool instance', async () => {
            expect(pool).toBeInstanceOf(Pool)

            // expect(pool).toMatchObject({
            // poolContract: expect.any(ethers.Contract),
        })

        test('should have tokens addresses', () => {
            expect(pool.token0).toBe(token0)
            expect(pool.token1).toBe(token1)
        })

        test('should have a hash', () => {
            expect(pool.hash).toBeDefined()
        })

        test('should have contracts', () => {
            expect(pool).toMatchObject({
                contracts: expect.objectContaining({
                    factory: expect.any(ethers.Contract),
                    router: expect.any(ethers.Contract),
                    quoter: expect.any(ethers.Contract),
                    nftDescriptorLibrary: expect.any(ethers.Contract),
                    positionDescriptor: expect.any(ethers.Contract),
                    positionManager: expect.any(ethers.Contract),
                    tokenFactory: expect.any(ethers.Contract)
                })
            })
        })

        test('should have provider,signer and defaultToken', () => {
            expect(pool).toMatchObject({
                provider: expect.any(ethers.providers.JsonRpcProvider),
                signer: expect.any(ethers.Signer)
                // defaultToken: expect.any(ethers.Contract)
            })
        })

        test('should not have poolContract deployed', () => {
            expect(pool.poolContract).toBeFalsy()
        })
    })

    describe('deployPool()', () => {
        test('should add poolContract', async () => {
            expect(pool.poolContract).toBeNull()
            const fee = FeeAmount.LOW
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
    })

    describe('openPosition()', () => {
        test('should add a new position to the pool', async () => {
            await pool.openPosition('0.1')
            expect
        })
    })

    describe('getPoolContract()', () => {
        test('should get the pool address', async () => {
            const fee = 500
            const poolAddress = await pool.getPoolContract(token0, token1, fee)
            expect(poolAddress).toBeDefined()
            expect(poolAddress).toBe(pool.poolContract.address)
        })

        test('should throw an error if the pool is not found', async () => {
            const invalidToken = ethers.constants.AddressZero
            const fee = 3000
            await expect(
                pool.getPoolContract(invalidToken, token1, fee)
            ).rejects.toThrow('Pool not found')
        })
    })

    test('swap() should perform a swap between token0 and token1', async () => {
        const amount = '0.1'
        await expect(pool.swap(amount)).resolves.not.toThrow()
    })
})