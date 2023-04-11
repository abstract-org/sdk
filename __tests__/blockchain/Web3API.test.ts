import { BigNumber, ethers } from 'ethers'
import Web3API, { Web3ApiConfig } from '@/api/web3/Web3API'
import { Pool } from '@/blockchain/modules/Pool'
import { Quest } from '@/blockchain/modules'
import { initializeUniswapContracts } from '@/blockchain/utils/initializeUniswapContracts'
import { initializeTokenFactory } from '@/blockchain/utils/initializeTokenFactory'
import { initializeDefaultToken } from '@/blockchain/utils/initializeDefaultToken'
import { FeeAmount } from '@uniswap/v3-sdk'

jest.mock('@/blockchain/modules/Pool', () => {
    return {
        Pool: jest.fn().mockImplementation(() => {
            return {
                deployPool: jest.fn().mockResolvedValue(undefined),
                openPosition: jest.fn().mockResolvedValue(undefined),
                swap: jest.fn().mockResolvedValue(undefined)
            }
        }),
        create: jest.fn()
    }
})

jest.mock('@/blockchain/modules', () => {
    return {
        Quest: {
            create: jest.fn().mockResolvedValue(undefined)
        }
    }
})

const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)

describe('Web3API', () => {
    let web3API: Web3API
    let config: Web3ApiConfig

    beforeAll(() => {
        const provider = new ethers.providers.StaticJsonRpcProvider(providerUrl)
        const signer = new ethers.Wallet(privateKey, provider)
        config = {
            provider,
            signer,
            contracts: {
                ...initializeUniswapContracts(signer),
                tokenFactory: initializeTokenFactory(signer)
            },
            defaultToken: initializeDefaultToken(signer)
        }
    })

    beforeEach(() => {
        web3API = new Web3API(config)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('createQuest', () => {
        it('should create a new Quest instance', async () => {
            const name = 'Test Quest'
            const kind = 'test'
            const content = 'This is a test quest.'

            await web3API.createQuest(name, kind, content)

            expect(Quest.create).toHaveBeenCalledWith(
                name,
                kind,
                content,
                config
            )
        })
    })

    describe('createPool', () => {
        it('should create a new Pool instance and deploy the pool', async () => {
            const token0 = '0x1234567890123456789012345678901234567890'
            const token1 = '0x0987654321098765432109876543210987654321'
            const opts = { fee: FeeAmount.LOWEST, sqrtPrice: BigNumber.from(0) }

            const mockPool = {
                deployPool: jest.fn().mockResolvedValue(undefined)
            }
            Pool.create = jest.fn().mockResolvedValueOnce(mockPool)

            const result = await web3API.createPool(token0, token1, opts)

            expect(Pool.create).toHaveBeenCalledWith(token0, token1, config)
            expect(mockPool.deployPool).toHaveBeenCalledWith(opts)
            expect(result).toBe(mockPool)
        })
    })

    describe('openPoolPosition', () => {
        it('should call the Pool instance method openPosition', async () => {
            const mockPool = new Pool()

            const initialValues = {
                min: 1000,
                max: 2000,
                tokenA: '0xaabbccddeeff0011',
                tokenB: '0x1122334455667788'
            }

            await web3API.openPoolPosition(mockPool, initialValues)

            expect(mockPool.openPosition).toHaveBeenCalledWith(
                Object.values(initialValues).join(',')
            )
        })
    })

    describe('swap', () => {
        it('should call the Pool instance method swap', async () => {
            const mockPool = new Pool()
            const amount = 100
            const zeroForOne = true

            await web3API.swap(mockPool, amount, zeroForOne)

            expect(mockPool.swap).toHaveBeenCalledWith(amount, zeroForOne)
        })
    })

    describe('citeQuest (stub)', () => {
        it('should return true', () => {
            const questId = 0x12345678
            const userId = 'test-user'
            const result = web3API.citeQuest(questId, userId)

            expect(result).toBe(true)
        })
    })
})
