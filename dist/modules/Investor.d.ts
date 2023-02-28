import HashMap from 'hashmap';
import { Pool } from './Pool';
import { Quest } from './Quest';
export declare class Investor {
    hash: any;
    type: any;
    name: any;
    default: boolean;
    balances: {
        USDC: number;
    };
    initialBalance: number;
    positions: HashMap<unknown, unknown>;
    questsCreated: any[];
    balancesLogs: any[];
    private PRICE_RANGE_MULTIPLIER;
    /**
     * @description Instantiates new Investor with params
     * @param {string} type
     * @param {string} name
     * @param {number} usdcBalance
     * @param {boolean} isDefault
     * @returns {Investor}
     */
    static create(type: any, name: any, usdcBalance?: number, isDefault?: boolean): Investor;
    createQuest(name: any): Quest;
    addBalance(tokenName: any, balance: any, msg?: any): boolean;
    removeLiquidity(pool: any, priceMin: any, priceMax: any, amountLeft?: number, amountRight?: number): any;
    private modifyPosition;
    createPool(citedToken: any, citingToken: any, startingPrice: any): Pool;
    /**
     * @param {Object} crossPool
     * @param {number} priceMin
     * @param {number} priceMax
     * @param {number} token0Amt
     * @param {number} token1Amt
     * @param {boolean} native
     * @returns {*[]}
     */
    citeQuest(crossPool: any, priceMin?: number, priceMax?: number, token0Amt?: number, token1Amt?: number, native?: boolean): any[];
    /**
     * @param {Pool} crossPool
     * @param {Pool} citedQuestPool
     * @param {Pool} citingQuestPool
     * @param {number} multiplier
     * @returns {object{min: number, max: number}}
     * @description Preferred base unit of price range is B/A (cited/citing)
     */
    calculatePriceRange(crossPool: any, citedQuestPool: any, citingQuestPool: any, multiplier?: number): {
        min: number;
        max: number;
        native: boolean;
    };
}
//# sourceMappingURL=Investor.d.ts.map