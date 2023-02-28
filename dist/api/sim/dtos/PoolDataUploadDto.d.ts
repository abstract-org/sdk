/// <reference types="hashmap" />
export declare class PoolDataUploadDto {
    swap_id: number;
    pool_id: number;
    current_liquidity: number;
    current_price: number;
    current_price_point_lg2: number;
    current_left_lg2: number;
    current_right_lg2: number;
    token0_price: number;
    volume_token0: number;
    token1_price: number;
    volume_token1: number;
    tvl: number;
    mcap: number;
    created_at: Date;
    is_fresh: boolean;
    total_sold: number;
    sold_token0: number;
    sold_token1: number;
    constructor(data: any, poolMappings: HashMap<string, number>);
}
//# sourceMappingURL=PoolDataUploadDto.d.ts.map