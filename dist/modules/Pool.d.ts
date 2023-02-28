import HashMap from 'hashmap';
import { Quest } from './Quest';
export declare class Pool {
    id: string;
    name: any;
    FRESH: boolean;
    tokenLeft: any;
    tokenRight: any;
    curLeft: number;
    curRight: number;
    curPrice: number;
    curPP: number;
    curLiq: number;
    totalSold: number;
    priceToken0: number;
    priceToken1: number;
    volumeToken0: number;
    volumeToken1: number;
    soldToken0: number;
    soldToken1: number;
    pos: HashMap<any, any>;
    posOwners: any[];
    type: string;
    private dryState;
    /**
     * @description Instantiates new Pool with params
     * @param {Object} tokenLeft
     * @param {Object} tokenRight
     * @param startingPrice
     * @returns {Pool}
     */
    static create(tokenLeft: Quest, tokenRight: Quest, startingPrice: any): Pool;
    initializePoolBoundaries(): void;
    setPositionSingle(price: any, liquidity: any): void;
    modifyPositionSingle(price: any, liquidity: any): void;
    /**
     * @description Opens position in the provided price range and adding provided amount of tokens into pool with calculated liquidity
     * @param {number} priceMin
     * @param {number} priceMax
     * @param {number} token0Amt
     * @param {number} token1Amt
     * @param {boolean} native
     * @returns {[number, number]}
     */
    openPosition(priceMin: any, priceMax: any, token0Amt?: number, token1Amt?: number, native?: boolean): any[];
    setActiveLiq(pMin: any, native: any): void;
    findActiveLiq(dir: any, native?: boolean): any;
    getNearestActiveLiq(zeroForOne: any): number[];
    /**
     * @TODO: Returns mixed liquidities when both tokens provided??
     * @param {number} token0
     * @param {number} token1
     * @param {number} sqrtPriceMin
     * @param {number} sqrtPriceMax
     * @param {number} currentSqrtPrice
     * @returns {number}
     */
    getLiquidityForAmounts(token0: any, token1: any, sqrtPriceMin: any, sqrtPriceMax: any, currentSqrtPrice: any): number;
    getAmountsForLiquidity(liquidity: any, sqrtPriceMin: any, sqrtPriceMax: any, curSqrtPrice: any): number[];
    dryBuy(amount: any, priceLimit?: any): number[];
    buy(amount: any, priceLimit?: any, dry?: boolean): number[];
    sell(amount: any, priceLimit?: any, dry?: boolean): number[];
    drySell(amount: any, priceLimit?: any): number[];
    swap(amount: any, zeroForOne: any): number[];
    /**
     *
     * @param {number} amount
     * @param {boolean} zeroForOne
     * @returns
     */
    drySwap(amount: any, zeroForOne: any): number[];
    getType(): string;
    isQuest(): boolean;
    getSwapInfo(logOut?: boolean): number[][];
    getTVL(): number;
    getMarketCap(): number;
    getUSDCValue(): number;
    getDecPos(): {
        left: number;
        pp: number;
        right: number;
        liq: any;
    }[];
}
//# sourceMappingURL=Pool.d.ts.map