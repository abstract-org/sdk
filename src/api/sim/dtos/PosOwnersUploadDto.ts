export default class PosOwnersUploadDto {
    amt0: number
    amt1: number
    hash: string
    native: boolean
    pmax: number
    pmin: number
    type: string
    pool_id: number
    investor_id: number

    constructor(data, poolId, investorId) {
        this.amt0 = data.amt0
        this.amt1 = data.amt1
        this.hash = data.hash
        this.native = data.native
        this.pmax = data.pmax
        this.pmin = data.pmin
        this.type = data.type
        this.pool_id = poolId
        this.investor_id = investorId
    }

    toObj() {
        return {
            amt0: this.amt0,
            amt1: this.amt1,
            hash: this.hash,
            native: this.native,
            pmax: this.pmax,
            pmin: this.pmin,
            type: this.type,
            pool_id: this.pool_id,
            investor_id: this.investor_id
        }
    }
}
