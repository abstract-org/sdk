import {
    initializeDefaultToken,
    initializeTokenFactory,
    initializeUniswapContracts
} from '@/blockchain/utils'

import dotenv from 'dotenv'
import { ethers } from 'ethers'
dotenv.config()

const providerUrl = String(process.env.PROVIDER_URL)
const privateKey = String(process.env.TEST_PRIVATE_KEY)

export function initializeWeb3ApiConfig() {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl)
    const wallet = new ethers.Wallet(privateKey, provider)
    const signer = wallet.connect(provider)
    return {
        provider,
        signer,
        contracts: {
            ...initializeUniswapContracts(signer),
            tokenFactory: initializeTokenFactory(signer)
        },
        defaultToken: initializeDefaultToken(signer)
    }
}
