import { Quest, UsdcToken } from '../../../modules';
export declare class QuestDto {
    id: number;
    author_id: number;
    name: string;
    hash: string;
    is_human: boolean;
    pools: string[];
    initial_balance_a: number;
    initial_balance_b: number;
    created_at: Date;
    constructor(data: any, pools: any);
    toName(): string;
    toQuest(): UsdcToken | Quest;
    private _makeUsdcInstance;
    private _makeTokenInstance;
}
//# sourceMappingURL=QuestDto.d.ts.map