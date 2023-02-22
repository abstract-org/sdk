export class LogDto {
    id: number
    pool_id: number
    pool_name: string
    wallet_id: number
    wallet_hash: string
    swap_id: number
    action: string
    day: number
    mcap: number
    op_name: string
    price: string
    total_amount_in: number
    total_amount_out: number
    tvl: number
    blk: number

    constructor(data) {
        this.id = data.id
        this.blk = data.blk
        this.pool_id = data.pool_id
        this.pool_name = data.pool.name
        this.wallet_id = data.wallet_id
        this.wallet_hash = data.wallet.hash
        this.swap_id = data.swap_id
        this.action = data.action
        this.day = data.day
        this.mcap = data.mcap
        this.tvl = data.tvl
        this.op_name = data.op_name
        this.price = data.price || null
        this.total_amount_in = data.total_amount_in
        this.total_amount_out = data.total_amount_out
    }

    toObj() {
        return {
            blk: this.blk,
            action: this.action,
            day: this.day,
            walletHash: this.wallet_hash,
            mcap: this.mcap,
            opName: this.op_name,
            paths: this.pool_name,
            pool: this.pool_name,
            price: this.price,
            totalAmountIn: this.total_amount_in,
            totalAmountOut: this.total_amount_out,
            tvl: this.tvl
        }
    }
}
