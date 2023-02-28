export class SwapDto {
    id;
    price;
    pool_id;
    investor_id;
    mcap;
    tvl;
    op_name;
    pool;
    investorHash;
    action;
    amount_in;
    amount_out;
    day;
    block;
    path;
    constructor(data, poolNames, investorHashes) {
        this.id = data.id;
        this.price = data.price;
        this.mcap = data.mcap;
        this.tvl = data.tvl;
        this.op_name = data.op_name;
        this.pool = poolNames.get(data.pool_id);
        this.investorHash = investorHashes.get(data.investor_id);
        this.action = data.action;
        this.amount_in = data.amount_in;
        this.amount_out = data.amount_out;
        this.day = data.day;
        this.block = data.block;
        this.path = data.path;
    }
    toObj() {
        return {
            pool: this.pool,
            price: this.price,
            investorHash: this.investorHash,
            action: this.action,
            mcap: this.mcap,
            tvl: this.tvl,
            totalAmountIn: this.amount_in,
            totalAmountOut: this.amount_out,
            paths: this.path,
            day: this.day,
            opName: this.op_name
        };
    }
}
//# sourceMappingURL=SwapDto.js.map