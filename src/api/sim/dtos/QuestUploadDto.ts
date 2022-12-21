export default class QuestUploadDto {
    author_id: number
    name: string
    hash: string
    is_human: boolean
    initial_balance_a: number
    initial_balance_b: number
    created_at: Date

    constructor(data, investorMappings) {
        this.name = data.name
        // fields below should fallback to DB defaults for USDC token
        this.author_id = investorMappings.get(data.name)
        this.hash = data.hash || '0x0000'
        this.is_human = !!data.isHuman
        this.initial_balance_a = data.initialBalanceA || 0
        this.initial_balance_b = data.initialBalanceB || 0
        this.created_at = data.created_at || new Date()
    }

    // @TODO: delete commented lines if toObj() is equivalent toJSON()
    // toObj() {
    //     return {
    //         author_id: this.author_id,
    //         name: this.name,
    //         hash: this.hash,
    //         is_human: this.is_human,
    //         initial_balance_a: this.initial_balance_a,
    //         initial_balance_b: this.initial_balance_b
    //     }
    // }
}
