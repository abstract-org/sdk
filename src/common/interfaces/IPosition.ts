export interface IPosition {
    liquidity: number
    leftPoint: number
    rightPoint: number
    pricePoint: number
}

export interface IPositionLiquidity {
    left: number
    right: number
    pp: number
    liquidity: number
}

export type DefaultLiquidityPosition = {
    priceMin: number
    priceMax: number
    tokenA: number
    tokenB: number
}
