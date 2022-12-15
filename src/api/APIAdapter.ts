import IAPI from './IAPI'

export default class APIAdapter implements IAPI {
    constructor(private target: any) {}

    createQuest(name: string, description: string): boolean {
        return this.target.createQuest(name, description)
    }

    createPool(name: string, description: string): boolean {
        return this.target.createPool(name, description)
    }

    citeQuest(questId: string, userId: string): boolean {
        return this.target.citeQuest(questId, userId)
    }

    buy(userId: string, itemId: string): boolean {
        return this.target.buy(userId, itemId)
    }

    sell(userId: string, itemId: string): boolean {
        return this.target.sell(userId, itemId)
    }
}
