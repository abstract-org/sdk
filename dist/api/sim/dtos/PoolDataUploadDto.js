import { convertNumToFloat8 } from '../../../utils/logicUtils';
export class PoolDataUploadDto {
    swap_id;
    pool_id;
    current_liquidity;
    current_price;
    current_price_point_lg2;
    current_left_lg2;
    current_right_lg2;
    token0_price;
    volume_token0;
    token1_price;
    volume_token1;
    tvl;
    mcap;
    created_at;
    is_fresh;
    total_sold;
    sold_token0;
    sold_token1;
    constructor(data, poolMappings) {
        this.pool_id = poolMappings.get(data.name);
        this.current_liquidity = data.curLiq;
        this.current_price = convertNumToFloat8(data.curPrice);
        this.current_price_point_lg2 = convertNumToFloat8(data.curPP);
        this.current_left_lg2 = convertNumToFloat8(data.curLeft);
        this.current_right_lg2 = convertNumToFloat8(data.curRight);
        this.token0_price = data.priceToken0;
        this.token1_price = data.priceToken1;
        this.volume_token0 = data.volumeToken0;
        this.volume_token1 = data.volumeToken1;
        this.tvl = data.tvl || 0;
        this.mcap = data.mcap || 0;
        this.created_at = data.created_at || new Date();
        this.is_fresh = data.FRESH;
        this.total_sold = data.totalSold;
        this.sold_token0 = data.soldToken0;
        this.sold_token1 = data.soldToken1;
    }
}
//# sourceMappingURL=PoolDataUploadDto.js.map