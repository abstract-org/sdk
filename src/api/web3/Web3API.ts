import IAPI from '../IAPI'

export default class Web3API implements IAPI {
    createQuest(name: string, description: string): boolean {
        // alternate implementation details
        return true
    }

    createPool(name: string, description: string): boolean {
        // alternate implementation details
        return true
    }

    citeQuest(questId: string, userId: string): boolean {
        // alternate implementation details
        return true
    }

    buy(userId: string, itemId: string): boolean {
        // alternate implementation details
        return true
    }

    sell(userId: string, itemId: string): boolean {
        // alternate implementation details
        return true
    }
}
