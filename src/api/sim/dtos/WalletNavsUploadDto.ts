export class WalletNavsUploadDto {
    wallet_id: number
    usdc_nav: number
    token_nav: number
    day: number

    constructor(data) {
        this.wallet_id = data.wallet_id
        this.usdc_nav = data.usdc_nav
        this.token_nav = data.token_nav
        this.day = data.day
    }
}
