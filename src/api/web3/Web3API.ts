import { IAPI } from '../../common/interfaces'

export interface ConstructorWeb3Config {
    rpcUrl: string
    contracts: [] // <== from env at 1st
}

export default class Web3API implements IAPI {
    constructor(config: ConstructorWeb3Config) {}
    createQuest(name: string, description: string): boolean {
        // alternate implementation details
        return true
    }

    createPool(name: string, description: string): boolean {
        // alternate implementation details
        blockchain.Pool.create()
        return true
    }

    //openPosition

    //swap

    citeQuest(questId: number, userId: string): boolean {
        // alternate implementation details
        return true
    }
}
