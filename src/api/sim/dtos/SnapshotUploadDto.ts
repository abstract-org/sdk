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

    // @TODO: delete if not used
    // toObj() {
    //     return {
    //         seed: this.seed,
    //         scenario_id: this.scenario_id,
    //         creator_id: this.creator_id,
    //         current_day: this.current_day
    //     }
    // }
}