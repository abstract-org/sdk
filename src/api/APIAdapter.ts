import {IAPI} from './interfaces'

export default class APIAdapter implements IAPI {
    constructor(private target: any) {}

    createQuest(name: string, description: string): boolean {
        return this.target.createQuest(name, description)
    }

    createPool(name: string, description: string): boolean {
        return this.target.createPool(name, description)
    }

    citeQuest(questId: number, userId: string): boolean {
        return this.target.citeQuest(questId, userId)
    }
}
