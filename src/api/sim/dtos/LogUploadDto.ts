export default class LogUploadDto {
    pool_id: number
    investor_id: number
    action: string
    day: number
    mcap: number
    op_name: string
    price: string
    total_amount_in: number
    total_amount_out: number
    tvl: number
    blk: number

    constructor(data, poolMappings, investorMappings, idx) {
        this.blk = idx
        this.pool_id = poolMappings.get(data.pool)
        this.investor_id = investorMappings.get(data.investorHash)
        this.action = data.action
        this.day = data.day
        this.tvl = data.tvl || 0
        this.mcap = data.mcap || 0
        this.op_name = data.opName
        this.price = data.price
        this.total_amount_in = data.totalAmountIn
        this.total_amount_out = data.totalAmountOut
    }

    /** @deprecated */
    toObj() {
        return {
            blk: this.blk,
            pool_id: this.pool_id,
            investor_id: this.investor_id,
            action: this.action,
            day: this.day,
            mcap: this.mcap,
            tvl: this.tvl,
            op_name: this.op_name,
            price: this.price,
            total_amount_in: this.total_amount_in,
            total_amount_out: this.total_amount_out
        }
    }
}
