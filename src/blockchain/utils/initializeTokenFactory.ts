import { ethers } from 'ethers'

export const initializeTokenFactory = (
    deployer: ethers.Signer,
    tokenFactoryAddress: string,
    tokenFactoryABI: ethers.ContractInterface
): ethers.Contract =>
    new ethers.Contract(tokenFactoryAddress, tokenFactoryABI, deployer)
