import {Pool} from '@/blockchain/modules/Pool'
import {ethers} from 'ethers'
import {initializeUniswapContracts} from '@/blockchain/utils/initializeUniswapContracts'
import { Pool } from '@/blockchain/modules/Pool'
import lodash from 'lodash'
import { ethers } from 'ethers'
import {
    initializeUniswapContracts,
    TUniswapContracts
} from '@/blockchain/utils/initializeUniswapContracts'
import dotenv from 'dotenv'
import {encodePriceSqrt} from '@/blockchain/utils/encodedPriceSqrt'
import {nearestUsableTick} from '@uniswap/v3-sdk'
import {initializeTokenFactory} from '@/blockchain/utils/initializeTokenFactory'
import {initializeDefaultToken} from '@/blockchain/utils/initializeDefaultToken'
import { initializeDefaultToken } from '@/blockchain/utils/initializeDefaultToken'
import { Web3ApiConfig } from '@/api/web3/Web3API'
import { FeeAmount } from '@uniswap/v3-sdk'
import { encodePriceSqrt } from '@/blockchain/utils/encodedPriceSqrt'
import { initializeTokenFactory } from '@/blockchain/utils/initializeTokenFactory'
import {
    getPositions,
    getPositionsByIds
} from '@/blockchain/utils/getPositions'

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
            const { isDeployed, existingPoolAddress } = await pool.isDeployed();
            const poolParams = {
                fee: FeeAmount.LOW,
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
    })

    describe('openPosition()', () => {
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
    })

    describe('openPosition()', () => {
        beforeEach(async () => {
            await pool.deployPool({
                fee: FeeAmount.LOWEST,
                sqrtPrice: encodePriceSqrt(1, 1)
            })
        })

        test('should add a one position to the pool', async () => {
            const signerAddress = await apiConfig.signer.getAddress()
            const positionsBefore = await getPositions(
                apiConfig.contracts.positionManager,
                signerAddress
            )

            await pool.openPosition('0.1')
            const positionsAfter = await getPositions(
                apiConfig.contracts.positionManager,
                signerAddress
            )

            expect(positionsAfter.length).toBe(positionsBefore.length + 1)
        })

        test('should add correct liquidity', async () => {
            const signerAddress = await apiConfig.signer.getAddress()
            const positionsBefore = await getPositionsByIds(
                apiConfig.contracts.positionManager,
                signerAddress
            )
            const addedLiquidity = '0.1'

            await pool.openPosition(addedLiquidity)
            const positionsAfter = await getPositionsByIds(
                apiConfig.contracts.positionManager,
                signerAddress
            )
            const changedPositions = lodash.differenceWith(
                lodash.toPairs(positionsAfter),
                lodash.toPairs(positionsBefore),
                ([key1], [key2]) => key1 === key2
            )
            console.log(changedPositions)
            expect(changedPositions[0].liquidity).toBe(addedLiquidity)
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

    test.skip('swap() should perform a swap between token0 and token1', async () => {
        const amount = '0.1'
        await expect(pool.swap(amount)).resolves.not.toThrow()
    })
})
