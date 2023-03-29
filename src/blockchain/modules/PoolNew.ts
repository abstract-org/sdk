interface PoolConfig {
    token0: string;
    token1: string;
    fee: number;
}

interface OpenPositionConfig {
    poolAddress: string;
    liquidity: string;
}

export class PoolNew {
    static create(deployer, config: PoolConfig, sqrtPrice: number) {
        
    }

    static openPosition(deployer, config: OpenPositionConfig) {

    }
}