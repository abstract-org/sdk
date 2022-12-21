import { convertNumToFloat8 } from '../../../utils/logicUtils'

export default class PositionUploadDto {
    pool_id: number
    liquidity: number
    left_point: number
    right_point: number
    price_point: number
    created_at: Date

    constructor(data, poolId) {
        this.pool_id = poolId
        this.liquidity = data.liquidity
        this.left_point = convertNumToFloat8(data.left)
        this.right_point = convertNumToFloat8(data.right)
        this.price_point = convertNumToFloat8(data.pp)
        this.created_at = data.created_at || new Date()
    }

    toObj() {
        return {
            pool_id: this.pool_id,
            liquidity: this.liquidity,
            left_point: this.left_point,
            right_point: this.right_point,
            price_point: this.price_point,
            created_at: this.created_at
        }
    }
}
