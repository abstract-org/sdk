import { ethers } from 'ethers'
import { Quest } from '@/blockchain/modules/Quest'
import {
    encodePriceSqrt,
    initializeDefaultToken,
    initializeTokenFactory,
    initializeUniswapContracts
} from '@/blockchain/utils'
import { Web3ApiConfig } from '@/api/web3/Web3API'
import { Pool } from '@/blockchain/modules'
import { FeeAmount } from '@uniswap/v3-sdk'

const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)
const initialSupply = 100000

describe('CrossPool with Quest', () => {
    const poolParams = {
        fee: FeeAmount.LOW,
        sqrtPrice: encodePriceSqrt(100, 1),
        deployGasLimit: ethers.utils.hexlify(20000000)
    }

    let apiConfig: Web3ApiConfig
    let provider: any
    let signer: any
    let token0, token1, token2
    let wethToken0Pool: Pool, wethToken1Pool: Pool, wethToken2Pool: Pool

    let token0token1CrossPool: Pool,
        token1token2CrossPool: Pool,
        token0token2CrossPool: Pool

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(providerUrl)
        const wallet = new ethers.Wallet(privateKey, provider)
        signer = wallet.connect(provider)

        apiConfig = {
            provider,
            signer,
            contracts: {
                ...initializeUniswapContracts(signer),
                tokenFactory: initializeTokenFactory(signer)
            },
            defaultToken: initializeDefaultToken(signer)
        }

        token0 = await Quest.create(initialSupply, apiConfig, {
            name: 'Token0',
            kind: 'TITLE',
            content: 'Token0'
        })
        token1 = await Quest.create(initialSupply, apiConfig, {
            name: 'Token1',
            kind: 'TITLE',
            content: 'Token1'
        })
        token2 = await Quest.create(initialSupply, apiConfig, {
            name: 'Token2',
            kind: 'TITLE',
            content: 'Token2'
        })

        console.log(
            `Token0 deployed to address: ${token0.tokenContract.address}`
        )
        console.log(
            `Token1 deployed to address: ${token1.tokenContract.address}`
        )
        console.log(
            `Token2 deployed to address: ${token2.tokenContract.address}`
        )
    })

    test('Should assign balances of token0, token1, token2 to owner', async () => {
        const [token0Balance, token1Balance, token2Balance] = await Promise.all(
            [
                token0.getBalanceOf(signer.address),
                token1.getBalanceOf(signer.address),
                token2.getBalanceOf(signer.address)
            ]
        )

        expect(token0Balance).toEqual(
            ethers.utils.parseUnits(String(initialSupply), 18)
        )
        expect(token1Balance).toEqual(
            ethers.utils.parseUnits(String(initialSupply), 18)
        )
        expect(token2Balance).toEqual(
            ethers.utils.parseUnits(String(initialSupply), 18)
        )
    })

    it('Should create WETH pools with token0', async () => {
        wethToken0Pool = await Pool.create(
            apiConfig.defaultToken.address,
            token0.tokenContract.address,
            FeeAmount.LOW,
            apiConfig
        )

        await wethToken0Pool.deployPool(poolParams)

        console.log(
            `WETH-token0 Pool deployed to address: ${wethToken0Pool.poolContract.address}`
        )

        expect(wethToken0Pool.poolContract.address).toBeDefined()
    })

    it('Should create WETH pools with token1', async () => {
        wethToken1Pool = await Pool.create(
            apiConfig.defaultToken.address,
            token1.tokenContract.address,
            FeeAmount.LOW,
            apiConfig
        )

        await wethToken1Pool.deployPool(poolParams)

        console.log(
            `WETH-token1 Pool deployed to address: ${wethToken1Pool.poolContract.address}`
        )

        expect(wethToken1Pool.poolContract.address).toBeDefined()
    })

    it('Should create WETH pools with token2', async () => {
        wethToken2Pool = await Pool.create(
            apiConfig.defaultToken.address,
            token2.tokenContract.address,
            FeeAmount.LOW,
            apiConfig
        )

        await wethToken2Pool.deployPool(poolParams)

        console.log(
            `WETH-token2 Pool deployed to address: ${wethToken2Pool.poolContract.address}`
        )

        expect(wethToken2Pool.poolContract.address).toBeDefined()
    })

    it.skip('Should create token0-token1 cross pool', async () => {
        token0token1CrossPool = await Pool.create(
            token0.tokenContract.address,
            token1.tokenContract.address,
            FeeAmount.LOW,
            apiConfig
        )

        await token0token1CrossPool.deployPool({
            fee: FeeAmount.LOW,
            sqrtPrice: encodePriceSqrt(1, 1),
            deployGasLimit: ethers.utils.hexlify(20000000)
        })
        console.log(
            `token0-token1 CrossPool deployed to address: ${token0token1CrossPool.poolContract.address}`
        )
    })
})
