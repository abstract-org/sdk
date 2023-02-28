export class SwapUploadDto {
    action;
    amount_in;
    amount_out;
    day;
    block;
    path;
    pool_id;
    investor_id;
    price;
    mcap;
    tvl;
    op_name;
    constructor(data, poolMappings, investorMappings) {
        this.action = data.action || 'UNKNOWN';
        this.amount_in = data.totalAmountIn;
        this.amount_out = data.totalAmountOut;
        this.day = data.day || 0;
        this.block = data.block || 0;
        this.path = data.paths;
        this.pool_id = poolMappings.get(data.pool);
        this.investor_id = investorMappings.get(data.investorHash);
        this.price = data.price;
        this.mcap = data.mcap;
        this.tvl = data.tvl;
        this.op_name = data.opName;
    }
}
//# sourceMappingURL=SwapUploadDto.js.map