import { BigNumber, ethers } from 'ethers'

export interface PositionInfo {
    tickLower: number
    tickUpper: number
    liquidity: BigNumber
    feeGrowthInside0LastX128: BigNumber
    feeGrowthInside1LastX128: BigNumber
    tokensOwed0: BigNumber
    tokensOwed1: BigNumber
}

export const getPositions = async (
    positionManagerContract: ethers.Contract,
    ownerAddress: string
): Promise<PositionInfo[]> => {
    const positionIds = await getPositionIds(
        positionManagerContract,
        ownerAddress
    )
    let result = []
    for (const posId of positionIds) {
        result.push(await getPositionInfo(posId, positionManagerContract))
    }
    return result
}

async function getPositionIds(
    positionManagerContract: ethers.Contract,
    ownerAddress: string
): Promise<number[]> {
    if (!ownerAddress) {
        throw new Error('No ownerAddress available')
    }
    const numberOfPositions: number = await positionManagerContract.balanceOf(
        ownerAddress
    )
    // Get all positions
    const tokenIds = []
    for (let i = 0; i < numberOfPositions; i++) {
        const tokenOfOwnerByIndex: number =
            await positionManagerContract.tokenOfOwnerByIndex(ownerAddress, i)
        tokenIds.push(tokenOfOwnerByIndex)
    }

    return tokenIds
}

async function getPositionInfo(
    tokenId: number,
    positionContract: ethers.Contract
): Promise<PositionInfo> {
    if (!tokenId) {
        throw new Error('No tokenId available')
    }

    const position = await positionContract.positions(tokenId)

    return {
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        liquidity: position.liquidity,
        feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
        feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
        tokensOwed0: position.tokensOwed0,
        tokensOwed1: position.tokensOwed1
    }
}
