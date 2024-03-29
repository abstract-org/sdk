export class SwapUploadDto {
    action: string
    amount_in: number
    amount_out: number
    day: number
    block: number
    path: string
    pool_id: number
    wallet_id: number
    price: number
    mcap: number
    tvl: number
    op_name: string

    constructor(data, poolMappings, walletMappings) {
        this.action = data.action || 'UNKNOWN'
        this.amount_in = data.totalAmountIn
        this.amount_out = data.totalAmountOut
        this.day = data.day || 0
        this.block = data.block || 0
        this.path = data.paths
        this.pool_id = poolMappings.get(data.pool)
        this.wallet_id = walletMappings.get(data.walletHash)
        this.price = data.price
        this.mcap = data.mcap
        this.tvl = data.tvl
        this.op_name = data.opName
    }
}
