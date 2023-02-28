import { Quest, UsdcToken } from '../../../modules';
export class QuestDto {
    id;
    author_id;
    name;
    hash;
    is_human;
    pools;
    initial_balance_a;
    initial_balance_b;
    created_at;
    constructor(data, pools) {
        this.id = data.id;
        this.author_id = data.author_id;
        this.name = data.name;
        this.hash = data.hash;
        this.is_human = data.is_human;
        this.initial_balance_a = data.initial_balance_a;
        this.initial_balance_b = data.initial_balance_b;
        this.pools = pools;
        this.created_at = data.created_at;
    }
    toName() {
        return this.name;
    }
    toQuest() {
        return this.name === 'USDC'
            ? this._makeUsdcInstance()
            : this._makeTokenInstance();
    }
    _makeUsdcInstance() {
        const usdc = new UsdcToken();
        usdc.name = this.name;
        usdc.pools = this.pools;
        return usdc;
    }
    _makeTokenInstance() {
        const token = new Quest();
        token.name = this.name;
        token.pools = this.pools;
        token.id = this.id;
        token.hash = this.hash;
        token.initialBalanceA = this.initial_balance_a;
        token.initialBalanceB = this.initial_balance_b;
        return token;
    }
}
//# sourceMappingURL=QuestDto.js.map