export class InvestorNavsUploadDto {
    investor_id: number
    usdc_nav: number
    token_nav: number
    day: number

    constructor(data) {
        this.investor_id = data.investor_id
        this.usdc_nav = data.usdc_nav
        this.token_nav = data.token_nav
        this.day = data.day
    }
}
