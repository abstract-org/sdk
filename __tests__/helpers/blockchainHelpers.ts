import { ethers } from 'ethers'
import erc20abi from '@/blockchain/abi/ERC20ABI.json'

export async function getTokenBalances(
    contractAddresses: Array<string | undefined>,
    wallet: ethers.Wallet | ethers.Signer
) {
    const walletAddress = await wallet.getAddress()

    const balances = await Promise.all(
        contractAddresses.map(async (address) => {
            if (!address) return undefined

            const contract = new ethers.Contract(address, erc20abi.abi, wallet)
            const tokenName = await contract.name()
            const balance = await contract.balanceOf(walletAddress)

            return [tokenName, ethers.utils.formatEther(balance)]
        })
    )

    console.table(balances.filter((balance) => balance))
}
