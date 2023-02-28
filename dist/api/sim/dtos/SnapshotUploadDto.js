export class SnapshotUploadDto {
    seed;
    scenario_id;
    current_day;
    creator_id;
    constructor(data) {
        this.seed = data.seed;
        this.scenario_id = data.scenarioId;
        this.current_day = data.currentDay;
        this.creator_id = data.creatorId;
    }
}
//# sourceMappingURL=SnapshotUploadDto.js.map