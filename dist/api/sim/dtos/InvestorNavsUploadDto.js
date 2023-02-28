export class InvestorNavsUploadDto {
    investor_id;
    usdc_nav;
    token_nav;
    day;
    constructor(data) {
        this.investor_id = data.investor_id;
        this.usdc_nav = data.usdc_nav;
        this.token_nav = data.token_nav;
        this.day = data.day;
    }
}
//# sourceMappingURL=InvestorNavsUploadDto.js.map