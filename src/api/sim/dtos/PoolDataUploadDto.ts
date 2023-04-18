import { convertNumToFloat8 } from '../../../common/utils/logicUtils'

export class PoolDataUploadDto {
    swap_id: number
    pool_id: number
    current_liquidity: number
    current_price: number
    current_price_point_lg2: number
    current_left_lg2: number
    current_right_lg2: number
    token0_price: number
    volume_token0: number
    token1_price: number
    volume_token1: number
    tvl: number
    mcap: number
    created_at: Date
    total_sold: number
    sold_token0: number
    sold_token1: number

    constructor(data, poolMappings: HashMap<string, number>) {
        this.pool_id = poolMappings.get(data.name)
        this.current_liquidity = data.curLiq
        this.current_price = convertNumToFloat8(data.curPrice)
        this.current_price_point_lg2 = convertNumToFloat8(data.curPP)
        this.current_left_lg2 = convertNumToFloat8(data.curLeft)
        this.current_right_lg2 = convertNumToFloat8(data.curRight)
        this.token0_price = data.questLeftPrice
        this.token1_price = data.questRightPrice
        this.volume_token0 = data.questLeftVolume
        this.volume_token1 = data.questRightVolume
        this.tvl = data.tvl || 0
        this.mcap = data.mcap || 0
        this.created_at = data.created_at || new Date()
        this.total_sold = data.totalSold
        this.sold_token0 = data.soldToken0
        this.sold_token1 = data.soldToken1
    }

    // @TODO: uncomment if toObj() is used
    // toObj() {
    //     return {
    //         pool_id: this.pool_id,
    //         current_liquidity: this.current_liquidity,
    //         current_price: this.current_price,
    //         current_price_point_lg2: this.current_price_point_lg2,
    //         current_left_lg2: this.current_left_lg2,
    //         current_right_lg2: this.current_right_lg2,
    //         token0_price: this.token0_price,
    //         volume_token0: this.volume_token0,
    //         token1_price: this.token1_price,
    //         volume_token1: this.volume_token1,
    //         tvl: this.tvl,
    //         mcap: this.mcap,
    //         created_at: this.created_at,
    //         total_sold: this.total_sold,
    //         sold_token0: this.sold_token0,
    //         sold_token1: this.sold_token1
    //     }
    // }
}
