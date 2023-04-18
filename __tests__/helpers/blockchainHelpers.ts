import { ethers } from 'ethers'
import erc20abi from '@/blockchain/abi/ERC20ABI.json'
import JSBI from 'jsbi'
import BigNumber from 'bignumber.js'
import { Position } from '@uniswap/v3-sdk'
import { Pool } from '@/blockchain/modules'

export async function getTokenBalances(
    contractAddresses: Array<string | undefined>,
    wallet: ethers.Wallet | ethers.Signer
) {
    const walletAddress = await wallet.getAddress()

    const balances = await Promise.all(
        contractAddresses.map(async (address) => {
            if (!address) return []
            let balance
            let tokenName
            try {
                const contract = new ethers.Contract(
                    address,
                    erc20abi.abi,
                    wallet
                )
                tokenName = await contract.name()
                balance = await contract.balanceOf(walletAddress)
            } catch (e) {
                console.log('Error in getTokenBalances for address:', address)
                return []
            }

            return {
                tokenName,
                address,
                balanceETH: Number(ethers.utils.formatEther(balance)).toFixed(3)
            }
        })
    )

    return balances.reduce((acc, { tokenName, ...values }: any) => {
        if (tokenName) acc[tokenName] = values
        return acc
    }, {})
}

export function sqrtPriceX96ToPrice(
    sqrtPriceX96: ethers.BigNumber,
    token0Decimals: number = 18,
    token1Decimals: number = 18
): string {
    const sqrtPriceX96BigInt = JSBI.BigInt(sqrtPriceX96.toString())

    // Calculate the price from the sqrtPriceX96 value
    const priceBigInt = JSBI.divide(
        JSBI.multiply(sqrtPriceX96BigInt, sqrtPriceX96BigInt),
        JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))
    )

    // Convert the price to a human-readable format.
    const scaleFactor = new BigNumber(10).pow(token1Decimals - token0Decimals)
    const priceNumber = new BigNumber(priceBigInt.toString()).times(scaleFactor)
    return priceNumber.toFixed(4)
}

// /* Example usage */
// const token0Decimals = 18 // WETH
// const token1Decimals = 6 // USDC
// const sqrtPriceX96 = ethers.BigNumber.from('79228162514264337593543950336') // Example sqrtPriceX96 value
// const price = sqrtPriceX96ToPrice(sqrtPriceX96, token0Decimals, token1Decimals)
// console.log(price) // Outputs: "2000.0000"

type PriceBand = {
    priceMin: number
    priceMax: number
    amount0: number
    amount1: number
}

export async function getPriceBandLiquidity(pool: Pool, priceBand: PriceBand) {
    const { tickSpacing } = await pool.getPoolStateData()
    const { tickLower, tickUpper } = pool.calcTicksRange(
        priceBand.priceMin,
        priceBand.priceMax,
        tickSpacing
    )
    const uniswapPool = await pool.constructUniswapV3Pool()
    const position = Position.fromAmounts({
        pool: uniswapPool,
        tickLower: tickLower,
        tickUpper: tickUpper,
        amount0: ethers.utils.parseEther(String(priceBand.amount0)).toString(),
        amount1: ethers.utils.parseEther(String(priceBand.amount1)).toString(),
        useFullPrecision: true
    })

    // const liquidityChange = position.liquidity.toString()
    // console.log('### liquidityChange (wei) = ', liquidityChange)
    // console.log(
    //     '### liquidityChange (ETH) = ',
    //     ethers.utils.formatEther(liquidityChange)
    // )

    return position.liquidity.toString()
}
