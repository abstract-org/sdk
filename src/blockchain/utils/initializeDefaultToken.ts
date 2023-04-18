import { ethers } from 'ethers'
import dotenv from 'dotenv'
dotenv.config()
import WETHTokenArtifact from '@/blockchain/abi/WETH9Token.json'

const WETHTokenAddress = String(process.env.WETH_ADDRESS)
export const initializeDefaultToken = (
    deployer: ethers.Signer
): ethers.Contract =>
    new ethers.Contract(WETHTokenAddress, WETHTokenArtifact.abi, deployer)
