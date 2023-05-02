import { ethers } from 'ethers'

export const initializeDefaultToken = (
    deployer: ethers.Signer,
    defaultTokenAddress: string,
    defaultTokenABI: ethers.ContractInterface
): ethers.Contract =>
    new ethers.Contract(defaultTokenAddress, defaultTokenABI, deployer)
