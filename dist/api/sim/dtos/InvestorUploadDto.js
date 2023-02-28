export class InvestorUploadDto {
    name;
    type;
    hash;
    initial_balance;
    created_at;
    constructor(data) {
        this.name = data.name;
        this.type = data.type;
        this.hash = data.hash;
        this.initial_balance = data.initialBalance;
        this.created_at = data.created_at || new Date();
    }
}
//# sourceMappingURL=InvestorUploadDto.js.map