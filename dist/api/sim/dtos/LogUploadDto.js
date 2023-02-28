export class LogUploadDto {
    pool_id;
    investor_id;
    action;
    day;
    mcap;
    op_name;
    price;
    total_amount_in;
    total_amount_out;
    tvl;
    blk;
    constructor(data, poolMappings, investorMappings, idx) {
        this.blk = idx;
        this.pool_id = poolMappings.get(data.pool);
        this.investor_id = investorMappings.get(data.investorHash);
        this.action = data.action;
        this.day = data.day;
        this.tvl = data.tvl || 0;
        this.mcap = data.mcap || 0;
        this.op_name = data.opName;
        this.price = data.price;
        this.total_amount_in = data.totalAmountIn;
        this.total_amount_out = data.totalAmountOut;
    }
}
//# sourceMappingURL=LogUploadDto.js.map