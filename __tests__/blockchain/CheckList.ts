import { BigNumber, ethers, Wallet } from 'ethers'
import { FeeAmount, nearestUsableTick } from '@uniswap/v3-sdk'
import { Web3ApiConfig } from '@/api/web3/Web3API'
import { Pool } from '@/blockchain/modules/Pool'
import { encodePriceSqrt } from '@/blockchain/utils'
import { initializeWeb3ApiConfig } from '../helpers/initializeWeb3ApiConfig'
import { Quest } from '@/blockchain/modules'
import { faker } from '@faker-js/faker'
import { getTokenBalances } from '../helpers/blockchainHelpers'

describe('Blockchain/Checklist flow', () => {
    let wethTokenContract: ethers.Contract
    let tokenAContract: ethers.Contract
    let tokenBContract: ethers.Contract
    let apiConfig: Web3ApiConfig
    const pools = {
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

    async function printBalances(title: string) {
        const balances = await getTokenBalances(
            [...Object.values(addresses)],
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

    describe('Open positions (4 price bands single sided) on WETH pool', () => {
        const metadataQuestA = {
            name: 'TESTA' + faker.random.alphaNumeric(5),
            kind: 'TITLE',
            content: 'Title content A_TEST'
        }

        const metadataQuestB = {
            name: 'TESTB' + faker.random.alphaNumeric(5),
            kind: 'TITLE',
            content: 'Title content B_TEST'
        }

        const defaultTokenSupply = 20000

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
                sqrtPrice: encodePriceSqrt(100, 1)
            }
            await pool.deployPool(poolParams)
            addresses.poolWethA = pool.poolContract.address

            const poolImmutables = await pool.getPoolImmutables()

            expect(pool.poolContract.address).toBeDefined()
            expect(poolImmutables.token0).toBe(pool.token0)
            expect(poolImmutables.token1).toBe(pool.token1)
            expect(poolImmutables.fee).toBe(poolParams.fee)
        })

        test("should open Weth-A pool's single-sided position 1", async () => {
            const pool = pools.poolWethA
            const { tick, tickSpacing } = await pool.getPoolStateData()

            const lowerTick =
                nearestUsableTick(tick, tickSpacing) - tickSpacing * 4

            console.log('Current Tick: ', [tick, tickSpacing])
            console.log('Lower Tick: ', lowerTick)

            // Should open position for range upper than current price
            await pool.openSingleSidedPosition(String(1), lowerTick, 'token0')

            expect('TODO').toBe('TODO')
        })

        test.skip('should create token B', async () => {
            const quest = await Quest.create(
                defaultTokenSupply,
                apiConfig,
                metadataQuestA
            )
            quests.questB = quest // save in global dictionary
            addresses.tokenB = quest.tokenContract.address

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
        })

        test.skip('should create pool Weth-B', async () => {
            const pool = await Pool.create(
                addresses.weth,
                addresses.tokenB,
                FeeAmount.LOW,
                apiConfig
            )
            pools.poolWethB = pool
            expect(pool).toBeInstanceOf(Pool)
        })

        test.skip('should deploy pool Weth-B', async () => {
            const pool = pools.poolWethB
            const poolParams = {
                fee: FeeAmount.LOW,
                sqrtPrice: encodePriceSqrt(100, 1)
            }
            await pool.deployPool(poolParams)
            addresses.poolWethB = pool.poolContract.address

            const poolImmutables = await pool.getPoolImmutables()

            expect(pool.poolContract.address).toBeDefined()
            expect(poolImmutables.token0).toBe(pool.token0)
            expect(poolImmutables.token1).toBe(pool.token1)
            expect(poolImmutables.fee).toBe(poolParams.fee)
        })

        test.skip("should open Weth-B pool's single-sided position 1", async () => {
            const pool = pools.poolWethB
            const { tick, tickSpacing } = await pool.getPoolStateData()

            const lowerTick =
                nearestUsableTick(tick, tickSpacing) - tickSpacing * 4

            console.log('Current Tick: ', [tick, tickSpacing])
            console.log('Lower Tick: ', lowerTick)

            await pool.openSingleSidedPosition(
                String(defaultTokenSupply),
                lowerTick,
                pool.tokensSwapped ? 'token1' : 'token0'
            )

            expect('TODO').toBe('TODO')
        })
    })

    describe('Buy some amount on WETH pool and store that amount in your wallet', () => {
        test('wallet should have at least 10 WETH', async () => {
            const walletAddress = await apiConfig.signer.getAddress()
            const wethBalance = await wethTokenContract.balanceOf(walletAddress)
            const remainder = wethBalance.mod(1e14)
            const wethBalanceFormatted = ethers.utils.formatEther(
                wethBalance.sub(remainder)
            )
            await printBalances('wallet should have at least 10 WETH')
            expect(Number(wethBalanceFormatted)).toBeGreaterThan(10)
        })

        test('buy tokens for 10 weth', async () => {
            const pool = pools.poolWethA
            if (addresses.weth === pool.token0) {
                await pool.swapExactInputSingle('0.001')
                await printBalances('buy tokens for 10 weth')
            }
        })
    })

    describe('Define price for a new cross pool', () => {
        //Define price for a new cross pool
        // by taking citingTokenPriceInWethPool / citedTokenPriceInWethPool
        // and setting that as current price of cross pool
        test('', async () => {})

        test('', async () => {})
    })

    describe('Open position on cross pool', () => {
        // Open position on cross pool with amount purchased in step 2
        test('', async () => {})

        test('', async () => {})
    })

    describe('Swap (buy) some amount of WETH pool and cross pool', () => {
        test('', async () => {})

        test('', async () => {})
    })

    describe('Swap (sell) some amount of WETH pool and cross pool', () => {
        test('', async () => {})

        test('', async () => {})
    })

    describe('Smart swap in path WETH-A-B', () => {
        // Smart swap in path WETH-A-B and make sure pool states change everywhere accordingly
        test('', async () => {})

        test('', async () => {})
    })
})
