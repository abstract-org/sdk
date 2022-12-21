import { convertFloat8ToNum } from '../../../utils/logicUtils'

export default class PositionDto {
    id: number
    pool_id: number
    liquidity: number
    left_point: number
    right_point: number
    price_point: number
    created_at: Date

    constructor(data) {
        this.id = data.id
        this.pool_id = data.pool_id
        this.liquidity = data.liquidity
        this.created_at = data.created_at
        this.left_point = convertFloat8ToNum(data.left_point)
        this.right_point = convertFloat8ToNum(data.right_point)
        this.price_point = convertFloat8ToNum(data.price_point)
    }

    toObj() {
        return {
            liquidity: this.liquidity,
            left: this.left_point,
            right: this.right_point,
            pp: this.price_point
        }
    }
}
