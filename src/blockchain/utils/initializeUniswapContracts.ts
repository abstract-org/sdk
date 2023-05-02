import { ethers } from 'ethers'

import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import UniswapV3Factory from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import SwapRouter from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'
import NFTDescriptor from '@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json'
import NonfungibleTokenPositionDescriptor from '@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json'
import NonfungiblePositionManager from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'

type ContractJson = { abi: Object[]; bytecode: string }
type ContractAddresses = Record<string, string>
export const UniswapContractArtifacts: { [name: string]: ContractJson } = {
    Quoter,
    UniswapV3Factory,
    SwapRouter,
    NFTDescriptor,
    NonfungibleTokenPositionDescriptor,
    NonfungiblePositionManager
}

export type TUniswapContracts = {
    factory: ethers.Contract
    router: ethers.Contract
    quoter: ethers.Contract
    nftDescriptorLibrary: ethers.Contract
    positionDescriptor: ethers.Contract
    positionManager: ethers.Contract
}

export const initializeUniswapContracts = (
    deployer: ethers.Signer,
    contractAddresses?: ContractAddresses
): TUniswapContracts => ({
    factory: new ethers.Contract(
        String(contractAddresses['UNISWAP_FACTORY_ADDRESS']),
        UniswapContractArtifacts.UniswapV3Factory.abi,
        deployer
    ),
    router: new ethers.Contract(
        String(contractAddresses['UNISWAP_ROUTER_ADDRESS']),
        UniswapContractArtifacts.SwapRouter.abi,
        deployer
    ),
    quoter: new ethers.Contract(
        String(contractAddresses['UNISWAP_QUOTER_ADDRESS']),
        UniswapContractArtifacts.Quoter.abi,
        deployer
    ),
    nftDescriptorLibrary: new ethers.Contract(
        String(contractAddresses['UNISWAP_NFT_DESCRIPTOR_LIBRARY_ADDRESS']),
        UniswapContractArtifacts.NFTDescriptor.abi,
        deployer
    ),
    positionDescriptor: new ethers.Contract(
        String(contractAddresses['UNISWAP_POSITION_DESCRIPTOR_ADDRESS']),
        UniswapContractArtifacts.NonfungibleTokenPositionDescriptor.abi,
        deployer
    ),
    positionManager: new ethers.Contract(
        String(contractAddresses['UNISWAP_POSITION_MANAGER_ADDRESS']),
        UniswapContractArtifacts.NonfungiblePositionManager.abi,
        deployer
    )
})
