export class InvestorBalancesUploadDto {
    investor_id;
    quest_id;
    balance;
    day;
    constructor(data) {
        this.investor_id = data.investor_id;
        this.quest_id = data.quest_id;
        this.balance = data.balance;
        this.day = parseInt(data.day);
    }
}
//# sourceMappingURL=InvestorBalancesUploadDto.js.map