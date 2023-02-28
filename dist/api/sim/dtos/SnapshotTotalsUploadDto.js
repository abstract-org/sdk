export class SnapshotTotalsUploadDto {
    snapshot_id;
    quests;
    cross_pools;
    investors;
    tvl;
    mcap;
    usdc;
    constructor(data) {
        this.snapshot_id = data.snapshot_id;
        this.quests = data.quests;
        this.cross_pools = data.cross_pools;
        this.investors = data.investors;
        this.tvl = Math.round(data.tvl);
        this.mcap = Math.round(data.mcap);
        this.usdc = Math.round(data.usdc);
    }
}
//# sourceMappingURL=SnapshotTotalsUploadDto.js.map