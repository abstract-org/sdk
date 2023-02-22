export class QuestUploadDto {
    author_id: number
    name: string
    hash: string
    is_human: boolean
    created_at: Date

    constructor(data, walletMappings) {
        this.name = data.name
        // fields below should fallback to DB defaults for USDC token
        this.author_id = walletMappings.get(data.name)
        this.hash = data.hash || '0x0000'
        this.is_human = !!data.isHuman
        this.created_at = data.created_at || new Date()
    }

    // @TODO: delete commented lines if toObj() is equivalent toJSON()
    // toObj() {
    //     return {
    //         author_id: this.author_id,
    //         name: this.name,
    //         hash: this.hash,
    //         is_human: this.is_human
    //     }
    // }
}
