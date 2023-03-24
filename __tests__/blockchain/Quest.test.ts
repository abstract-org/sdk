import { ethers } from 'ethers'
import { Quest, TEMP_CONFIG } from '@/blockchain/modules/Quest'
import {
    initializeUniswapContracts,
    TUniswapContracts
} from '@/blockchain/utils/initializeUniswapContracts'
import { Pool } from '@/blockchain/modules/Pool'
const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)

describe('blockchain Quest entity', () => {
    let apiConfig: {
        provider: ethers.providers.JsonRpcProvider
        signer: ethers.Signer
        contracts: TUniswapContracts
    }
    let quest: Quest

    beforeAll(async () => {
        const provider = new ethers.providers.StaticJsonRpcProvider(providerUrl)
        const signer = new ethers.Wallet(privateKey, provider)
        const contracts = initializeUniswapContracts(signer)
        apiConfig = {
            provider,
            signer,
            contracts
        }
        quest = await Quest.create(
            'TEST TOKEN',
            'TITLE',
            'Test content',
            apiConfig
        )
    })

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

    test('Quest should create a pool successfully', async () => {
        const pool = await quest.createPool()
        expect(pool).toBeInstanceOf(Pool)
    })

    test('Quest should initialize pool positions', async () => {
        const pool = await quest.createPool()
        await quest.initializePoolPositions(pool, TEMP_CONFIG.INITIAL_LIQUIDITY)

        // in order to check positions write helpers for fetching positions from pool 1st
    })
})
