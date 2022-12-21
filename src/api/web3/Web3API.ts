import {IAPI} from '../../interfaces'
import {ConstructorWeb3Config} from "../../index";

export default class Web3API implements IAPI {
    constructor(config: ConstructorWeb3Config) {

    }
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
