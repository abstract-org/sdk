export declare class PositionDto {
    id: number;
    pool_id: number;
    liquidity: number;
    left_point: number;
    right_point: number;
    price_point: number;
    created_at: Date;
    constructor(data: any);
    toObj(): {
        liquidity: number;
        left: number;
        right: number;
        pp: number;
    };
}
//# sourceMappingURL=PositionDto.d.ts.map