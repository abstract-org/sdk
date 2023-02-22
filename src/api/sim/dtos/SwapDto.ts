export class SwapDto {
    id: number
    price: number
    pool_id: number
    wallet_id: number
    mcap: number
    tvl: number
    op_name: string
    pool: string
    walletHash: number
    action: string
    amount_in: number
    amount_out: number
    day: number
    block: number
    path: string

    constructor(data, poolNames, walletHashes) {
        this.id = data.id
        this.price = data.price
        this.mcap = data.mcap
        this.tvl = data.tvl
        this.op_name = data.op_name
        this.pool = poolNames.get(data.pool_id)
        this.walletHash = walletHashes.get(data.wallet_id)
        this.action = data.action
        this.amount_in = data.amount_in
        this.amount_out = data.amount_out
        this.day = data.day
        this.block = data.block
        this.path = data.path
    }

    toObj() {
        return {
            pool: this.pool,
            price: this.price,
            walletHash: this.walletHash,
            action: this.action,
            mcap: this.mcap,
            tvl: this.tvl,
            totalAmountIn: this.amount_in,
            totalAmountOut: this.amount_out,
            paths: this.path,
            day: this.day,
            opName: this.op_name
        }
    }
}
