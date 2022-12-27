export class PoolUploadDto {
    name: string
    token0: string
    token1: string
    type: string
    hash: string
    created_at: Date

    constructor(data, questNameToQuestId) {
        this.name = data.name
        this.type = data.type
        this.token0 = questNameToQuestId.get(data.tokenLeft)
        this.token1 = questNameToQuestId.get(data.tokenRight)
        this.hash = data.hash || 'hash'
        this.created_at = data.created_at || new Date()
    }

    // @TODO: uncomment if PoolDto.toObj() is ever used
    // toObj() {
    //     return {
    //         name: this.name,
    //         type: this.type,
    //         token0: this.token0,
    //         token1: this.token1,
    //         hash: this.hash,
    //         created_at: this.created_at
    //     }
    // }
}
