export class SnapshotTotalsUploadDto {
    snapshot_id: number
    quests: number
    cross_pools: number
    investors: number
    tvl: number
    mcap: number
    usdc: number

    constructor(data) {
        this.snapshot_id = data.snapshot_id
        this.quests = data.quests
        this.cross_pools = data.cross_pools
        this.investors = data.investors
        this.tvl = Math.round(data.tvl)
        this.mcap = Math.round(data.mcap)
        this.usdc = Math.round(data.usdc)
    }
}
