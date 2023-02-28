import { IAPI } from '../../interfaces';
export interface ConstructorWeb3Config {
    rpcUrl: string;
}
export default class Web3API implements IAPI {
    constructor(config: ConstructorWeb3Config);
    createQuest(name: string, description: string): boolean;
    createPool(name: string, description: string): boolean;
    citeQuest(questId: number, userId: string): boolean;
}
//# sourceMappingURL=Web3API.d.ts.map