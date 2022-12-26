export default class SnapshotUploadDto {
    seed: string
    scenario_id: number
    current_day: number
    creator_id: number

    constructor(data) {
        this.seed = data.seed
        this.scenario_id = data.scenarioId
        this.current_day = data.currentDay
        this.creator_id = data.creatorId
    }
}
