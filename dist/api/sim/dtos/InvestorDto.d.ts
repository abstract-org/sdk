import { Investor } from '../../../modules';
export type TInvestorBalance = {
    id?: number;
    day: number;
    balance: number;
    quest: {
        name: string;
    };
};
export type TInvestorNav = {
    id?: number;
    investor_id?: number;
    day: number;
    usdc_nav: number;
    token_nav: number;
};
export declare class InvestorDto {
    id: number;
    name: string;
    type: string;
    hash: string;
    initial_balance: number;
    investor_balances: TInvestorBalance[];
    investor_navs: TInvestorNav[];
    quests: Array<{
        name: string;
    }>;
    created_at: Date;
    constructor(data: any);
    toHash(): string;
    toInvestor(): Investor;
    toObj(): {
        id: number;
        name: string;
        type: string;
        hash: string;
        initial_balance: number;
        balances: {
            USDC: number;
        };
        questsCreated: string[];
    };
    private _getLatestDayBalances;
}
//# sourceMappingURL=InvestorDto.d.ts.map