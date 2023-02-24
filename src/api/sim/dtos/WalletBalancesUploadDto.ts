export class WalletBalancesUploadDto {
    wallet_id: number
    quest_id: number
    balance: number
    day: number

    constructor(data) {
        this.wallet_id = data.wallet_id
        this.quest_id = data.quest_id
        this.balance = data.balance
        this.day = parseInt(data.day)
    }
}
