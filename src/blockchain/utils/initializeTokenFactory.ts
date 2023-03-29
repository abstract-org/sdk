import { ethers } from 'ethers'
import dotenv from 'dotenv'
dotenv.config()
import TokenFactoryArtifact from '@/blockchain/abi/FactoryABI.json'

const TokenFactoryAddress = String(process.env.SIMPLE_TOKEN_FACTORY_ADDRESS)
export const initializeTokenFactory = (
    deployer: ethers.Signer
): ethers.Contract =>
    new ethers.Contract(TokenFactoryAddress, TokenFactoryArtifact.abi, deployer)
