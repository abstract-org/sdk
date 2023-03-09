import { convertFloat8ToNum } from '../../../common/utils/logicUtils'

export class PoolDataDto {
    id: number
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

    constructor(data) {
        this.id = data.id
        this.swap_id = data.swap_id
        this.pool_id = data.pool_id
        this.current_liquidity = data.current_liquidity
        this.current_price = convertFloat8ToNum(data.current_price)
        this.current_price_point_lg2 = convertFloat8ToNum(
            data.current_price_point_lg2
        )
        this.current_left_lg2 = convertFloat8ToNum(data.current_left_lg2)
        this.current_right_lg2 = convertFloat8ToNum(data.current_right_lg2)

        this.token0_price = data.token0_price
        this.volume_token0 = data.volume_token0
        this.token1_price = data.token1_price
        this.volume_token1 = data.volume_token1
        this.tvl = data.tvl
        this.mcap = data.mcap
        this.created_at = data.created_at
        this.total_sold = data.total_sold
        this.sold_token0 = data.sold_token0
        this.sold_token1 = data.sold_token1
    }

    toObj() {
        return {
            id: this.id,
            swap_id: this.swap_id,
            pool_id: this.pool_id,
            current_liquidity: this.current_liquidity,
            current_price: this.current_price,
            current_price_point_lg2: this.current_price_point_lg2,
            current_left_lg2: this.current_left_lg2,
            current_right_lg2: this.current_right_lg2,
            token0_price: this.token0_price,
            volume_token0: this.volume_token0,
            token1_price: this.token1_price,
            volume_token1: this.volume_token1,
            tvl: this.tvl,
            mcap: this.mcap,
            created_at: this.created_at,
            total_sold: this.total_sold,
            sold_token0: this.sold_token0,
            sold_token1: this.sold_token1
        }
    }
}
