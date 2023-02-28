import { SnapshotDto } from './SnapshotDto';
export class SnapshotWithTotalsDto extends SnapshotDto {
    quests;
    cross_pools;
    investors;
    tvl;
    mcap;
    usdc;
    creator_email;
    constructor(data) {
        super(data);
        const totalsData = data.snapshot_totals[0];
        if (totalsData) {
            this.quests = totalsData.quests;
            this.cross_pools = totalsData.cross_pools;
            this.investors = totalsData.investors;
            this.tvl = totalsData.tvl;
            this.mcap = totalsData.mcap;
            this.usdc = totalsData.usdc;
            this.creator_email = data.creator?.email || '';
        }
    }
    toObj() {
        return {
            id: this.id,
            seed: this.seed,
            scenario_id: this.scenario_id,
            created_at: this.created_at,
            quests: this.quests,
            cross_pools: this.cross_pools,
            investors: this.investors,
            tvl: this.tvl,
            mcap: this.mcap,
            usdc: this.usdc,
            creator_email: this.creator_email
        };
    }
}
//# sourceMappingURL=SnapshotWithTotalsDto.js.map