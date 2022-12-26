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
}
