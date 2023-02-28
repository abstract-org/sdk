import { SnapshotDto } from './SnapshotDto';
export declare class SnapshotWithTotalsDto extends SnapshotDto {
    quests: number;
    cross_pools: number;
    investors: number;
    tvl: number;
    mcap: number;
    usdc: number;
    creator_email: string;
    constructor(data: any);
    toObj(): {
        id: number;
        seed: string;
        scenario_id: number;
        created_at: Date;
        quests: number;
        cross_pools: number;
        investors: number;
        tvl: number;
        mcap: number;
        usdc: number;
        creator_email: string;
    };
}
//# sourceMappingURL=SnapshotWithTotalsDto.d.ts.map