import { IAPI } from '../../interfaces'
import { Quest } from '../../modules'

export interface ConstructorWeb3Config {
    rpcUrl: string
}

export default class Web3API implements IAPI {
    constructor(config: ConstructorWeb3Config) {}

    createQuest(
        snapshotId: number,
        investorId: number,
        quest: Partial<Omit<Quest, 'id'>>,
        followingId?: string
    ): Promise<Quest> {
        // alternate implementation details
        return Promise.resolve(quest as Quest)
    }

    createPool(name: string, description: string): boolean {
        // alternate implementation details
        return true
    }

    citeQuest(questId: number, userId: string): boolean {
        // alternate implementation details
        return true
    }

    fetchQuest(questId: string): Promise<Quest> {
        // alternate implementation details
        return Promise.resolve(null as Quest)
    }
}
