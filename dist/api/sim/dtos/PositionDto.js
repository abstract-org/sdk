import { convertFloat8ToNum } from '../../../utils/logicUtils';
export class PositionDto {
    id;
    pool_id;
    liquidity;
    left_point;
    right_point;
    price_point;
    created_at;
    constructor(data) {
        this.id = data.id;
        this.pool_id = data.pool_id;
        this.liquidity = data.liquidity;
        this.created_at = data.created_at;
        this.left_point = convertFloat8ToNum(data.left_point);
        this.right_point = convertFloat8ToNum(data.right_point);
        this.price_point = convertFloat8ToNum(data.price_point);
    }
    toObj() {
        return {
            liquidity: this.liquidity,
            left: this.left_point,
            right: this.right_point,
            pp: this.price_point
        };
    }
}
//# sourceMappingURL=PositionDto.js.map