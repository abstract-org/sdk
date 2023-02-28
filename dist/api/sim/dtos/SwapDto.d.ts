export declare class SwapDto {
    id: number;
    price: number;
    pool_id: number;
    investor_id: number;
    mcap: number;
    tvl: number;
    op_name: string;
    pool: string;
    investorHash: number;
    action: string;
    amount_in: number;
    amount_out: number;
    day: number;
    block: number;
    path: string;
    constructor(data: any, poolNames: any, investorHashes: any);
    toObj(): {
        pool: string;
        price: number;
        investorHash: number;
        action: string;
        mcap: number;
        tvl: number;
        totalAmountIn: number;
        totalAmountOut: number;
        paths: string;
        day: number;
        opName: string;
    };
}
//# sourceMappingURL=SwapDto.d.ts.map