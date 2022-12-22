export default class SwapUploadDto {
    action: string
    amount_in: number
    amount_out: number
    day: number
    block: number
    path: string
    pool_id: number
    investor_id: number
    price: number
    mcap: number
    tvl: number
    op_name: string

    constructor(data, poolMappings, investorMappings) {
        this.action = data.action || 'UNKNOWN'
        this.amount_in = data.totalAmountIn
        this.amount_out = data.totalAmountOut
        this.day = data.day || 0
        this.block = data.block || 0
        this.path = data.paths
        this.pool_id = poolMappings.get(data.pool)
        this.investor_id = investorMappings.get(data.investorHash)
        this.price = data.price
        this.mcap = data.mcap
        this.tvl = data.tvl
        this.op_name = data.opName
    }

    // @TODO: delete this
    // toObj() {
    //     return {
    //         action: this.action,
    //         amount_in: this.amount_in,
    //         amount_out: this.amount_out,
    //         day: this.day,
    //         block: this.block,
    //         path: this.path,
    //         investor_id: this.investor_id,
    //         pool_id: this.pool_id,
    //         price: this.price,
    //         mcap: this.mcap,
    //         tvl: this.tvl,
    //         op_name: this.op_name
    //     }
    // }
}