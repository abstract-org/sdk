import {IAPI} from '../interfaces'
import {ConstructorSimConfig} from "../../index";

export default class SimAPI implements IAPI {
    constructor(config: ConstructorSimConfig) {

    }
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
