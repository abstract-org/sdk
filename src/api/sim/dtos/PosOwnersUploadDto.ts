export class PosOwnersUploadDto {
    amt0: number
    amt1: number
    hash: string
    native: boolean
    pmax: number
    pmin: number
    type: string
    pool_id: number
    wallet_id: number

    constructor(data, poolId, walletId) {
        this.amt0 = data.amt0
        this.amt1 = data.amt1
        this.hash = data.hash
        this.native = data.native
        this.pmax = data.pmax
        this.pmin = data.pmin
        this.type = data.type
        this.pool_id = poolId
        this.wallet_id = walletId
    }
}
