import { convertNumToFloat8 } from '../../../utils/logicUtils';
export class PositionUploadDto {
    pool_id;
    liquidity;
    left_point;
    right_point;
    price_point;
    created_at;
    constructor(data, poolId) {
        this.pool_id = poolId;
        this.liquidity = data.liquidity;
        this.left_point = convertNumToFloat8(data.left);
        this.right_point = convertNumToFloat8(data.right);
        this.price_point = convertNumToFloat8(data.pp);
        this.created_at = data.created_at || new Date();
    }
}
//# sourceMappingURL=PositionUploadDto.js.map