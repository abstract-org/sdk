import { ethers } from 'ethers'

export const estimateGasAmount = async (
    provider,
    contract,
    method,
    ...args
) => {
    try {
        const feeData = await provider.getFeeData()

        const functionGasFees = await contract.estimateGas[method](...args)
        const txEthAmount = ethers.utils.formatEther(
            functionGasFees.mul(feeData.maxFeePerGas)
        )

        console.log(
            `Estimated spend on Gas for calling contract.${method}(args): ${txEthAmount} ETH`
        )

        return txEthAmount
    } catch (e) {
        console.log(
            `Unable to estimate gas for calling contract.${method}(args)`
        )

        return 0;
    }
}
