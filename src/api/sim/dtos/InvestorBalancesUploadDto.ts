export default class InvestorBalancesUploadDto {
    investor_id: number
    quest_id: number
    balance: number
    day: number

    constructor(data) {
        this.investor_id = data.investor_id
        this.quest_id = data.quest_id
        this.balance = data.balance
        this.day = parseInt(data.day)
    }
}
