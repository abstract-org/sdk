import { BigNumber, ethers } from 'ethers'
import { FeeAmount, Position } from '@uniswap/v3-sdk'
import { Web3ApiConfig } from '@/api/web3/Web3API'
import { Pool } from '@/blockchain/modules/Pool'
import {
    encodePriceSqrt,
    findPositionsDiff,
    getPositionsByIds,
    priceToSqrtX96
} from '@/blockchain/utils'
import { initializeWeb3ApiConfig } from '../helpers/initializeWeb3ApiConfig'
import { Quest } from '@/blockchain/modules'
import { faker } from '@faker-js/faker'
import {
    getPriceBandLiquidity,
    getTokenBalances,
    sqrtPriceX96ToPrice
} from '../helpers/blockchainHelpers'
import JSBI from 'jsbi'

describe('Blockchain/Checklist flow', () => {
    let wethTokenContract: ethers.Contract
    let apiConfig: Web3ApiConfig
    const pools: Record<string, Pool> = {
        poolWethA: null,
        poolWethB: null,
        poolAB: null
    }
    const quests = {
        questA: null,
        questB: null
    }
    const addresses = {
        weth: null,
        tokenA: null,
        tokenB: null,
        poolWethA: null,
        poolWethB: null,
        poolAB: null
    }
    const defaultTokenSupply = 20000

    const printBalances = async (title: string) => {
        const balances = await getTokenBalances(
            [addresses.weth, addresses.tokenA, addresses.tokenB],
            apiConfig.signer
        )
        console.log(title)
        console.table(balances)
    }

    beforeAll(async () => {
        apiConfig = initializeWeb3ApiConfig()
        wethTokenContract = apiConfig.defaultToken
        addresses.weth = apiConfig.defaultToken.address
    })

    describe('Create token A and pool WETH-A', () => {
        const metadataQuestA = {
            name: 'TEST_A_' + faker.random.alphaNumeric(5),
            kind: 'TITLE',
            content: 'Title content A_TEST'
        }
        //
        // const metadataQuestB = {
        //     name: 'TEST_B_' + faker.random.alphaNumeric(5),
        //     kind: 'TITLE',
        //     content: 'Title content B_TEST'
        // }

        test('should create token A', async () => {
            const quest = await Quest.create(
                defaultTokenSupply,
                apiConfig,
                metadataQuestA
            )
            quests.questA = quest // save in global dictionary
            addresses.tokenA = quest.tokenContract.address

            expect(quest).toBeDefined()
            expect(quest).toBeInstanceOf(Quest)
            expect(quest.name).toBe(metadataQuestA.name)
            expect(quest.kind).toBe(metadataQuestA.kind)
            expect(quest.content).toBe(metadataQuestA.content)
            expect(quest.tokenContract).toBeTruthy()
            expect(quest.tokenContract).toBeInstanceOf(ethers.Contract)
            expect(quest.tokenContract.address).toBeTruthy()
            const defaultMintedAmount = ethers.utils.parseEther(
                String(defaultTokenSupply)
            )
            const walletAddress = await quest.getApiConfig().signer.getAddress()
            const balance = await quest.tokenContract.balanceOf(walletAddress)
            expect(balance).toEqual(defaultMintedAmount)
            await printBalances('should create token A')
        })

        test('should create pool Weth-A', async () => {
            const pool = await Pool.create(
                addresses.weth,
                addresses.tokenA,
                FeeAmount.LOW,
                apiConfig
            )
            pools.poolWethA = pool
            expect(pool).toBeInstanceOf(Pool)
        })

        test('should deploy pool Weth-A', async () => {
            const pool = pools.poolWethA
            const poolParams = {
                fee: FeeAmount.LOW,
                sqrtPrice: encodePriceSqrt(1, 1)
            }
            await pool.deployPool(poolParams)
            addresses.poolWethA = pool.poolContract.address

            const poolImmutables = await pool.getPoolImmutables()

            expect(pool.poolContract.address).toBeDefined()
            expect(poolImmutables.token0).toBe(pool.token0)
            expect(poolImmutables.token1).toBe(pool.token1)
            expect(poolImmutables.fee).toBe(poolParams.fee)
        })
    })

    describe('Open positions (4 price bands single sided) on WETH-A pool', () => {
        const poolName = 'poolWethA'
        let pool
        let signerAddress
        let positionsBefore

        beforeEach(async () => {
            pool = pools[poolName]
            signerAddress = await apiConfig.signer.getAddress()
            positionsBefore = await getPositionsByIds(
                apiConfig.contracts.positionManager,
                signerAddress
            )
        })

        test("should open Weth-A pool's single-sided position 1 - 100,000", async () => {
            const priceBand = {
                priceMin: 1,
                priceMax: 100000,
                amount0: 1,
                amount1: 5000
            }

            await pool.openPriceBandPosition(
                priceBand.priceMin,
                priceBand.priceMax,
                priceBand.amount0,
                priceBand.amount1
            )

            const liquidityChange = await getPriceBandLiquidity(pool, priceBand)
            expect(Number(liquidityChange)).toBeGreaterThan(0)

            const positionsAfter = await getPositionsByIds(
                apiConfig.contracts.positionManager,
                signerAddress
            )

            const changedPositions = findPositionsDiff(
                positionsAfter,
                positionsBefore
            )
            expect(changedPositions).toHaveLength(1)
            expect(changedPositions[0].tickLower).toBe(0)
            expect(changedPositions[0].tickUpper).toBe(115140)
            console.log(
                `Pool ${poolName}'s position [1 - 100,000] liquidity:`,
                ethers.utils.formatEther(
                    changedPositions[0].liquidity.toString()
                )
            )
        })

        test("should open Weth-A pool's single-sided position 20 - 100,000", async () => {
            const priceBand = {
                priceMin: 20,
                priceMax: 100000,
                amount0: 1,
                amount1: 5000
            }

            await pool.openPriceBandPosition(
                priceBand.priceMin,
                priceBand.priceMax,
                priceBand.amount0,
                priceBand.amount1
            )

            const positionsAfter = await getPositionsByIds(
                apiConfig.contracts.positionManager,
                signerAddress
            )

            const changedPositions = findPositionsDiff(
                positionsAfter,
                positionsBefore
            )
            expect(changedPositions).toHaveLength(1)
            expect(changedPositions[0].tickLower).toBe(29950)
            expect(changedPositions[0].tickUpper).toBe(115140)
            console.log(
                `Pool ${poolName}'s position [20 - 100,000] liquidity:`,
                ethers.utils.formatEther(
                    changedPositions[0].liquidity.toString()
                )
            )
        })

        test("should open Weth-A pool's single-sided position 50 - 100,000", async () => {
            const priceBand = {
                priceMin: 50,
                priceMax: 100000,
                amount0: 1,
                amount1: 5000
            }

            await pool.openPriceBandPosition(
                priceBand.priceMin,
                priceBand.priceMax,
                priceBand.amount0,
                priceBand.amount1
            )

            const positionsAfter = await getPositionsByIds(
                apiConfig.contracts.positionManager,
                signerAddress
            )

            const changedPositions = findPositionsDiff(
                positionsAfter,
                positionsBefore
            )
            expect(changedPositions).toHaveLength(1)
            expect(changedPositions[0].tickLower).toBe(39120)
            expect(changedPositions[0].tickUpper).toBe(115140)
            console.log(
                `Pool ${poolName}'s position [50 - 100,000] liquidity:`,
                ethers.utils.formatEther(
                    changedPositions[0].liquidity.toString()
                )
            )
        })

        test("should open Weth-A pool's single-sided position 200 - 100,000", async () => {
            const priceBand = {
                priceMin: 200,
                priceMax: 100000,
                amount0: 1,
                amount1: 5000
            }

            await pool.openPriceBandPosition(
                priceBand.priceMin,
                priceBand.priceMax,
                priceBand.amount0,
                priceBand.amount1
            )

            const positionsAfter = await getPositionsByIds(
                apiConfig.contracts.positionManager,
                signerAddress
            )

            const changedPositions = findPositionsDiff(
                positionsAfter,
                positionsBefore
            )
            expect(changedPositions).toHaveLength(1)
            expect(changedPositions[0].tickLower).toBe(52980)
            expect(changedPositions[0].tickUpper).toBe(115140)
            console.log(
                `Pool ${poolName}'s position [200 - 100,000] liquidity:`,
                ethers.utils.formatEther(
                    changedPositions[0].liquidity.toString()
                )
            )
        })

        test('pool data', async () => {
            const pool = pools.poolWethA
            const { tickSpacing, fee, liquidity, sqrtPriceX96, tick } =
                await pool.getPoolStateData()
            const slot0 = await pool.poolContract.slot0()

            console.log({
                tickSpacing,
                fee,
                liquidity: ethers.utils.formatEther(liquidity.toString()),
                sqrtPriceX96: sqrtPriceX96ToPrice(sqrtPriceX96),
                tick
            })
            console.log('slot0:', slot0)
        })
    })

    describe('Create token B and pool WETH-B', () => {
        const metadataQuestB = {
            name: 'TEST_B_' + faker.random.alphaNumeric(5),
            kind: 'TITLE',
            content: 'Title content B_TEST'
        }

        test('should create token B', async () => {
            const quest = await Quest.create(
                defaultTokenSupply,
                apiConfig,
                metadataQuestB
            )
            quests.questB = quest
            addresses.tokenB = quest.tokenContract.address
            await printBalances('should create token B')
        })

        test('should create pool Weth-B', async () => {
            const pool = await Pool.create(
                addresses.weth,
                addresses.tokenB,
                FeeAmount.LOW,
                apiConfig
            )
            pools.poolWethB = pool
            expect(pool).toBeInstanceOf(Pool)
        })

        test('should deploy pool Weth-B', async () => {
            const pool = pools.poolWethB
            const poolParams = {
                fee: FeeAmount.LOW,
                sqrtPrice: encodePriceSqrt(1, 1)
            }
            await pool.deployPool(poolParams)
            addresses.poolWethB = pool.poolContract.address

            const poolImmutables = await pool.getPoolImmutables()

            expect(pool.poolContract.address).toBeDefined()
            expect(poolImmutables.token0).toBe(pool.token0)
            expect(poolImmutables.token1).toBe(pool.token1)
            expect(poolImmutables.fee).toBe(poolParams.fee)
        })
    })

    describe('Open positions (4 price bands single sided) on WETH-B pool', () => {
        const poolName = 'poolWethB'
        let pool
        let signerAddress
        let positionsBefore

        beforeEach(async () => {
            pool = pools[poolName]
            signerAddress = await apiConfig.signer.getAddress()
            positionsBefore = await getPositionsByIds(
                apiConfig.contracts.positionManager,
                signerAddress
            )
        })

        test("should open Weth-B pool's single-sided position 1 - 100,000", async () => {
            const priceBand = {
                priceMin: 1,
                priceMax: 100000,
                amount0: 1,
                amount1: 5000
            }

            await pool.openPriceBandPosition(
                priceBand.priceMin,
                priceBand.priceMax,
                priceBand.amount0,
                priceBand.amount1
            )
        })

        test("should open Weth-B pool's single-sided position 20 - 100,000", async () => {
            const priceBand = {
                priceMin: 20,
                priceMax: 100000,
                amount0: 1,
                amount1: 5000
            }

            await pool.openPriceBandPosition(
                priceBand.priceMin,
                priceBand.priceMax,
                priceBand.amount0,
                priceBand.amount1
            )
        })

        test("should open Weth-B pool's single-sided position 50 - 100,000", async () => {
            const priceBand = {
                priceMin: 50,
                priceMax: 100000,
                amount0: 1,
                amount1: 5000
            }

            await pool.openPriceBandPosition(
                priceBand.priceMin,
                priceBand.priceMax,
                priceBand.amount0,
                priceBand.amount1
            )
        })

        test("should open Weth-B pool's single-sided position 200 - 100,000", async () => {
            const priceBand = {
                priceMin: 200,
                priceMax: 100000,
                amount0: 1,
                amount1: 5000
            }

            await pool.openPriceBandPosition(
                priceBand.priceMin,
                priceBand.priceMax,
                priceBand.amount0,
                priceBand.amount1
            )
        })

        test('pool WETH-B data', async () => {
            const pool = pools.poolWethA
            const { tickSpacing, fee, liquidity, sqrtPriceX96, tick } =
                await pool.getPoolStateData()

            console.log({ tickSpacing, fee, liquidity, sqrtPriceX96, tick })
        })
    })

    describe('Buy some amount on WETH-A pool and store that amount in your wallet', () => {
        test('wallet should have at least 10 WETH', async () => {
            const walletAddress = await apiConfig.signer.getAddress()
            const wethBalance = await wethTokenContract.balanceOf(walletAddress)
            const remainder = wethBalance.mod(1e14)
            const wethBalanceFormatted = ethers.utils.formatEther(
                wethBalance.sub(remainder)
            )
            await printBalances('wallet should have at least 1000 WETH')
            expect(Number(wethBalanceFormatted)).toBeGreaterThan(1000)
        })

        test('buy tokens A for 100 WETH', async () => {
            const pool = pools.poolWethA
            const isDirect = pool.isInverted
            await pool.swapExactInputSingle('100', isDirect)
            await printBalances('buy tokens A for 100 weth')
        })

        test('buy tokens B for 1 WETH', async () => {
            const pool = pools.poolWethB
            const isDirect = pool.isInverted
            await pool.swapExactInputSingle('1', isDirect)
            await printBalances('buy tokens B for 1 weth')
        })
    })

    describe('Define price for a new cross pool', () => {
        //Define price for a new cross pool
        // by taking citingTokenPriceInWethPool / citedTokenPriceInWethPool
        // and setting that as current price of cross pool
        let aBPrice
        let aBSqrtPriceX96

        beforeAll(async () => {
            const uniswapPoolWethA =
                await pools.poolWethA.constructUniswapV3Pool()
            const uniswapPoolWethB =
                await pools.poolWethB.constructUniswapV3Pool()
            const wethAPrice = !pools.poolWethA.isInverted
                ? uniswapPoolWethA.token0Price
                : uniswapPoolWethA.token1Price
            const wethBPrice = !pools.poolWethB.isInverted
                ? uniswapPoolWethB.token1Price
                : uniswapPoolWethB.token0Price

            aBPrice = wethAPrice.divide(wethBPrice)
            // Assuming `aBPrice` is a Fraction or Price instance from Uniswap SDK
            const aBPriceDecimal = aBPrice.toFixed(18) // Convert the price to a decimal string with 18 decimals
            aBSqrtPriceX96 = priceToSqrtX96(aBPriceDecimal)
            console.log('aBPrice', aBPrice)
            console.log('aBSqrtPriceX96', aBSqrtPriceX96)
            console.log('aBSqrtPriceX96.toString()', aBSqrtPriceX96.toString())
        })

        test('should create pool A-B', async () => {
            const pool = await Pool.create(
                addresses.tokenA,
                addresses.tokenB,
                FeeAmount.LOW,
                apiConfig
            )
            pools.poolAB = pool
            expect(pool).toBeInstanceOf(Pool)
        })

        test('should deploy pool A-B', async () => {
            const pool = pools.poolAB
            const poolParams = {
                fee: FeeAmount.LOW,
                // sqrtPrice: encodePriceSqrt(1, 1)
                sqrtPrice: aBSqrtPriceX96
            }
            await pool.deployPool(poolParams)
            addresses.poolAB = pool.poolContract.address

            const poolImmutables = await pool.getPoolImmutables()

            expect(pool.poolContract.address).toBeDefined()
            expect(poolImmutables.token0).toBe(pool.token0)
            expect(poolImmutables.token1).toBe(pool.token1)
            expect(poolImmutables.fee).toBe(poolParams.fee)
        })
    })

    describe('Open position on cross pool', () => {
        // Open position on cross pool with amount purchased in step 2
        test('', async () => {})

        test('', async () => {})
    })

    // describe('Swap (buy) some amount of WETH pool and cross pool', () => {
    //     test('', async () => {})
    //
    //     test('', async () => {})
    // })
    //
    // describe('Swap (sell) some amount of WETH pool and cross pool', () => {
    //     test('', async () => {})
    //
    //     test('', async () => {})
    // })
    //
    // describe('Smart swap in path WETH-A-B', () => {
    //     // Smart swap in path WETH-A-B and make sure pool states change everywhere accordingly
    //     test('', async () => {})
    //
    //     test('', async () => {})
    // })
})
