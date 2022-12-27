export class InvestorUploadDto {
    name: string
    type: string
    hash: boolean
    initial_balance: number
    created_at: Date

    constructor(data) {
        this.name = data.name
        this.type = data.type
        this.hash = data.hash
        this.initial_balance = data.initialBalance
        this.created_at = data.created_at || new Date()
    }

    // @TODO: delete commented lines if toObj() is equivalent toJSON()
    // toObj() {
    //     return {
    //         name: this.name,
    //         type: this.type,
    //         hash: this.hash,
    //         initial_balance: this.initial_balance,
    //         created_at: this.created_at
    //     }
    // }
}
