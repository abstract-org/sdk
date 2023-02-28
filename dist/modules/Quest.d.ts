import HashMap from 'hashmap';
import { Pool } from './Pool';
export declare class Quest {
    id: any;
    hash: any;
    name: any;
    pools: any[];
    initialBalanceA: number;
    initialBalanceB: number;
    positions: HashMap<unknown, unknown>;
    /**
     * @description Instantiates new Token with name
     * @param {string} name
     * @returns {Token}
     */
    static create(name: any): Quest;
    createPool({ tokenLeft, startingPrice, initialPositions }?: {
        tokenLeft?: any;
        startingPrice?: any;
        initialPositions?: any;
    }): Pool;
    /**
     * @param {Object} pool
     */
    addPool(pool: any): void;
    initializePoolPositions(pool: any, initialPositions: any): void;
}
//# sourceMappingURL=Quest.d.ts.map