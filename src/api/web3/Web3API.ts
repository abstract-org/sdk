import {IAPI} from '../interfaces'

export default class Web3API implements IAPI {
    createQuest(name: string, description: string): boolean {
        // alternate implementation details
        return true
    }

    createPool(name: string, description: string): boolean {
        // alternate implementation details
        return true
    }

    citeQuest(questId: number, userId: string): boolean {
        // alternate implementation details
        return true
    }
}
