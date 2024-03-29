export class PosOwnersDto {
    id: number
    amt0: number
    amt1: number
    hash: string
    native: boolean
    pmax: number
    pmin: number
    type: string
    wallet_id: number

    constructor(data) {
        this.id = data.id
        this.amt0 = data.amt0
        this.amt1 = data.amt1
        this.hash = data.hash
        this.native = data.native
        this.pmax = data.pmax
        this.pmin = data.pmin
        this.type = data.type
        this.wallet_id = data.wallet_id
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
            wallet_id: this.wallet_id
        }
    }
}
