import { ethers } from 'ethers'
import dotenv from 'dotenv'
dotenv.config()

type ContractJson = { abi: Object[]; bytecode: string }
const UniswapContractArtifacts: { [name: string]: ContractJson } = {
    Quoter: require('@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'),
    UniswapV3Factory: require('@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'),
    SwapRouter: require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'),
    NFTDescriptor: require('@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json'),
    NonfungibleTokenPositionDescriptor: require('@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json'),
    NonfungiblePositionManager: require('@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json')
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
    deployer: ethers.Signer
): TUniswapContracts => ({
    factory: new ethers.Contract(
        String(process.env.UNISWAP_FACTORY_ADDRESS),
        UniswapContractArtifacts.UniswapV3Factory.abi,
        deployer
    ),
    router: new ethers.Contract(
        String(process.env.UNISWAP_ROUTER_ADDRESS),
        UniswapContractArtifacts.SwapRouter.abi,
        deployer
    ),
    quoter: new ethers.Contract(
        String(process.env.UNISWAP_QUOTER_ADDRESS),
        UniswapContractArtifacts.Quoter.abi,
        deployer
    ),
    nftDescriptorLibrary: new ethers.Contract(
        String(process.env.UNISWAP_NFT_DESCRIPTOR_LIBRARY_ADDRESS),
        UniswapContractArtifacts.NFTDescriptor.abi,
        deployer
    ),
    positionDescriptor: new ethers.Contract(
        String(process.env.UNISWAP_POSITION_DESCRIPTOR_ADDRESS),
        UniswapContractArtifacts.NonfungibleTokenPositionDescriptor.abi,
        deployer
    ),
    positionManager: new ethers.Contract(
        String(process.env.UNISWAP_POSITION_MANAGER_ADDRESS),
        UniswapContractArtifacts.NonfungiblePositionManager.abi,
        deployer
    )
})
