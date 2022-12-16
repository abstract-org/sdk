import {IAPI} from '../interfaces'

export default class SimAPI implements IAPI {
    createQuest(name: string, description: string): boolean {
        // implementation details
        return true
    }

    createPool(name: string, description: string): boolean {
        // implementation details
        return true
    }

    citeQuest(questId: number, userId: string): boolean {
        // implementation details
        return true
    }

    buy(userId: string, itemId: string): boolean {
        // implementation details
        return true
    }

    sell(userId: string, itemId: string): boolean {
        // implementation details
        return true
    }
}
