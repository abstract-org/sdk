import {IAPI} from '../../interfaces'
import {ConstructorSimConfig} from "../../index";
import {Investor} from "../../modules";

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

    createInvestor(type: string, name: string, initialBalance: number, isDefault?: boolean): Investor {
        return Investor.create(type, name, initialBalance, isDefault)
    }
}
