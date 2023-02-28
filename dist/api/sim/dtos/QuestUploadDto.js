export class QuestUploadDto {
    author_id;
    name;
    hash;
    is_human;
    initial_balance_a;
    initial_balance_b;
    created_at;
    constructor(data, investorMappings) {
        this.name = data.name;
        // fields below should fallback to DB defaults for USDC token
        this.author_id = investorMappings.get(data.name);
        this.hash = data.hash || '0x0000';
        this.is_human = !!data.isHuman;
        this.initial_balance_a = data.initialBalanceA || 0;
        this.initial_balance_b = data.initialBalanceB || 0;
        this.created_at = data.created_at || new Date();
    }
}
//# sourceMappingURL=QuestUploadDto.js.map