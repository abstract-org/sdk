export class SnapshotDto {
    id;
    seed;
    scenario_id;
    created_at;
    constructor(data) {
        this.id = data.id;
        this.seed = data.seed;
        this.scenario_id = data.scenario_id || null;
        this.created_at = data.created_at;
    }
    toObj() {
        return {
            id: this.id,
            seed: this.seed,
            scenario_id: this.scenario_id,
            created_at: this.created_at
        };
    }
}
//# sourceMappingURL=SnapshotDto.js.map