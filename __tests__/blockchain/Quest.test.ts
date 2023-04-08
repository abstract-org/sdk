import { ethers } from 'ethers'
import { Quest, TEMP_CONFIG } from '@/blockchain/modules/Quest'
import {
    initializeUniswapContracts,
    TUniswapContracts
} from '@/blockchain/utils/initializeUniswapContracts'
import { Pool } from '@/blockchain/modules/Pool'
import { initializeDefaultToken } from '@/blockchain/utils/initializeDefaultToken'
import { Web3ApiConfig } from '@/api/web3/Web3API'
import { getPositions } from '@/blockchain/utils/getPositions'
import { initializeTokenFactory } from '@/blockchain/utils/initializeTokenFactory'

const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)

describe('Blockchain/Modules/Quest', () => {
    let apiConfig: Web3ApiConfig
    let quest: Quest

    beforeAll(async () => {
        const provider = new ethers.providers.StaticJsonRpcProvider(providerUrl)
        const signer = new ethers.Wallet(privateKey, provider)
        apiConfig = {
            provider,
            signer,
            contracts: {
                ...initializeUniswapContracts(signer),
                tokenFactory: initializeTokenFactory(signer)
            },
            defaultToken: initializeDefaultToken(signer)
        }
        quest = await Quest.create(
            100000,
            apiConfig,
            {
                name: 'TEST TOKEN',
                kind: 'TITLE',
                content: 'Test content'
            }
        )
    })

    describe('Quest.create()', () => {
        test('Quest should be created successfully', async () => {
            expect(quest).toBeInstanceOf(Quest)
            expect(quest.name).toBe('TEST TOKEN')
            expect(quest.kind).toBe('TITLE')
            expect(quest.content).toBe('Test content')
        })

        test('Quest should have a valid hash', async () => {
            expect(quest.hash).toBeTruthy()
            expect(typeof quest.hash).toBe('string')
        })

        test('Quest should deploy a token', async () => {
            const tokenContract = quest.tokenContract
            expect(tokenContract).toBeTruthy()
            expect(tokenContract.address).toBeTruthy()
        })

        test('Quest token symbol should be generated correctly', async () => {
            const symbol = quest.getTokenSymbol()
            expect(symbol).toBeTruthy()
            expect(typeof symbol).toBe('string')
        })

        test('Deployer received 20k tokens in their wallet', async () => {
            const defaultMintedAmount = ethers.utils.parseEther('100000')
            const walletAddress = quest.getApiConfig().signer.getAddress()
            const balance = await quest.tokenContract.balanceOf(walletAddress)
            expect(balance).toEqual(defaultMintedAmount)
        })
    })

    describe('Quest token exchange', () => {
        let otherSigner: ethers.Signer

        beforeEach(() => {
            const otherProvider = new ethers.providers.StaticJsonRpcProvider(
                providerUrl
            )
            otherProvider.pollingInterval = 50
            otherSigner = ethers.Wallet.createRandom().connect(
                apiConfig.provider
            )
        })

        it('should transfer tokens to another wallet', async () => {
            const token = quest.tokenContract
            const ownerAddress = quest.getApiConfig().signer.getAddress()
            const recipientAddress = otherSigner.getAddress()
            const ownerBalanceBefore = await token.balanceOf(ownerAddress)
            const recipientBalanceBefore = await token.balanceOf(
                recipientAddress
            )
            const transferAmount = ethers.utils.parseEther(
                String(Math.floor(Math.random() * 100))
            )
            await token.transfer(recipientAddress, transferAmount)

            const ownerBalanceAfter = await token.balanceOf(ownerAddress)
            const recipientBalanceAfter = await token.balanceOf(
                recipientAddress
            )
            expect(ownerBalanceAfter).toEqual(
                ownerBalanceBefore.sub(transferAmount)
            )
            expect(recipientBalanceAfter).toEqual(
                recipientBalanceBefore.add(transferAmount)
            )
        })
    })

    describe('Quest.createPool() default', () => {
        let pool = null

        beforeAll(async () => {
            pool = await quest.createPool()
        })

        test('without initialPositions argument', async () => {
            expect(pool).toBeInstanceOf(Pool)
        })

        test.skip('with initialPositions argument', async () => {
            expect(pool).toBeInstanceOf(Pool)
        })
    })

    describe('Quest.createPool() value-link', () => {
        let citedQuest = null
        let pool = null

        beforeAll(async () => {
            citedQuest = await Quest.create(
                100000,
                apiConfig,
                {
                    name: 'CITED TOKEN',
                    kind: 'TITLE',
                    content: 'Cited content'
                }
            )
            pool = await quest.createPool(citedQuest)
            await pool.deployPool()
        })

        test('create Pool instance citedQuest-thisQuest', async () => {
            expect(pool).toBeInstanceOf(Pool)
            expect(pool).toMatchObject({
                hash: expect.any(String),
                poolContract: null,
                provider: expect.any(ethers.providers.JsonRpcProvider),
                signer: expect.any(ethers.Signer),
                contracts: expect.objectContaining({
                    factory: expect.any(ethers.Contract),
                    router: expect.any(ethers.Contract),
                    quoter: expect.any(ethers.Contract),
                    nftDescriptorLibrary: expect.any(ethers.Contract),
                    positionDescriptor: expect.any(ethers.Contract),
                    positionManager: expect.any(ethers.Contract)
                })
            })
        })

        // FIXME: this one is failing with wrong addresses
        test('value-link with correct token addresses', async () => {
            expect(pool.token0).toBe(citedQuest.tokenContract.address)
            expect(pool.token1).toBe(quest.tokenContract.address)
        })
    })

    describe('Quest.initializePoolPositions()', () => {
        test('Quest should initialize pool positions', async () => {
            const pool = await quest.createPool()
            await quest.initializePoolPositions(
                pool,
                TEMP_CONFIG.INITIAL_LIQUIDITY
            )
            const signerAddress = await apiConfig.signer.getAddress()
            const positions = await getPositions(
                apiConfig.contracts.positionManager,
                signerAddress
            )

            expect(positions).toHaveLength(2)
            // in order to check positions write helpers for fetching positions from pool 1st
        })
    })
})
