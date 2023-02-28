export declare class LogDto {
    id: number;
    pool_id: number;
    pool_name: string;
    investor_id: number;
    investor_hash: string;
    swap_id: number;
    action: string;
    day: number;
    mcap: number;
    op_name: string;
    price: string;
    total_amount_in: number;
    total_amount_out: number;
    tvl: number;
    blk: number;
    constructor(data: any);
    toObj(): {
        blk: number;
        action: string;
        day: number;
        investorHash: string;
        mcap: number;
        opName: string;
        paths: string;
        pool: string;
        price: string;
        totalAmountIn: number;
        totalAmountOut: number;
        tvl: number;
    };
}
//# sourceMappingURL=LogDto.d.ts.map