import { Quest, UsdcToken } from '../../../modules'

export class QuestDto {
    id: number
    author_id: number
    name: string
    hash: string
    is_human: boolean
    pools: string[]
    created_at: Date

    constructor(data, pools) {
        this.id = data.id
        this.author_id = data.author_id
        this.name = data.name
        this.hash = data.hash
        this.is_human = data.is_human
        this.pools = pools
        this.created_at = data.created_at
    }

    toName() {
        return this.name
    }

    toQuest() {
        return this.name === 'USDC'
            ? this._makeUsdcInstance()
            : this._makeTokenInstance()
    }

    private _makeUsdcInstance() {
        const usdc = new UsdcToken()
        usdc.name = this.name
        usdc.pools = this.pools

        return usdc
    }

    private _makeTokenInstance() {
        const token = new Quest()
        token.name = this.name
        token.pools = this.pools
        token.id = this.id
        token.hash = this.hash

        return token
    }
}
