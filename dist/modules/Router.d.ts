import HashMap from 'hashmap';
import { Graph } from './Graph';
import { Pool } from './Pool';
import { Quest } from './Quest';
export declare class Router {
    _cachedPools: HashMap<string, Pool>;
    _cachedQuests: HashMap<string, Quest>;
    _shouldScanPaths: boolean;
    _PRICED_PATHS: any[];
    _SWAPS: any[];
    _PROTO_SWAPS: any[];
    _PAIR_PATHS: {};
    _DEFAULT_SWAP_SUM: number;
    _SWAP_SUM: number;
    _DEBUG: boolean;
    _visitedForGraph: any[];
    tempSwapReturns: number;
    /**
     *
     * @param {Array} stateQuests
     * @param {Array} statePools
     * @param {boolean} debug
     */
    constructor(stateQuests: any, statePools: any, debug?: boolean);
    /**
     * @param {string} token0
     * @param {string} token1
     * @param {number} amountIn
     * @param {number} smartRouteDepth
     * @param {number} forcedPath
     * @returns {*[]|number[]}
     */
    smartSwap(token0: any, token1: any, amountIn: any, smartRouteDepth?: number, forcedPath?: any): number[];
    setSwapSum(amountIn: any): void;
    /**
     * @description Calculates max amount could be thrown into swaps chain to have tokens without surplus
     * @param {number} amountIn
     * @param {string[]} path
     * @returns {number} max acceptable amount in for the path
     */
    getMaxAmountInForPath(amountIn: any, path: any): any;
    /**
     * @typedef {Object} PathAction
     * @property {string} action
     * @property {Pool} pool
     */
    /**
     * @description Fills in pathActions with max in/outs for each pool in path
     * @param {PathAction[]} pathActions
     * @returns {StepWithCaps[]}
     */
    getPathWithActionCaps(pathActions: any): any[];
    /**
     * @typedef {Object} PathActionCaps
     * @property {number} t0fort1
     * @property {number} t1fort0
     */
    /**
     * @typedef {PathAction & PathActionCaps} StepWithCaps
     */
    /**
     * @description Iterates path from the end verifying each step throughput
     * @param {StepWithCaps[]} pathWithActionCaps
     * @param {string[]} path - list of token names, needed to debug with _PROTO_SWAPS
     * @returns {number|*|number}
     */
    calculateAcceptableForCappedPathActions(pathWithActionCaps: any, path?: any[]): number;
    swapPricedPath(amountIn: any, path: any): any[];
    /**
     * @description Swap once within a given path with total amountIn
     * @param {number} amountIn
     * @param {string[]} path
     * @returns swaps array throughout the path
     */
    swapPath(amountIn: any, path: any): any[];
    /**
     * Takes array of string arrays (paths) and dry swaps each one of them to get their out/in price and sorts by best to worst price
     * @param {string[][]} paths
     * @returns Array of objects like {path: string[], price: number}
     */
    drySwapForPricedPaths(paths: any): any[];
    /**
     * @description Takes array path and swaps through the entire path and returns prices along the way
     * @param {string[]} path
     * @param {number} [amount]
     * @returns {[number, number][]} array of pairs
     */
    drySwapPath(path: any, amount?: number): any[];
    /**
     * @description For a requested token pair returns calculated pathways that should be then weighted for best price
     * @param {string} token0
     * @param {string} token1
     * @param {number} smartRouteDepth
     * @returns Array of possible paths
     */
    calculatePairPaths(token0: any, token1: any, smartRouteDepth: any): any[];
    /**
     * @description Finds all pools for a specific token under restricted depth
     * @param {string} tokenName
     * @param {number} maxDepth
     * @param {number} depth
     * @returns {[]|*[]}
     */
    findPoolsFor(tokenName: any, maxDepth?: number, depth?: number): any[];
    /**
     * @description Creates cyclic undirected graph of all connected pools
     * @param {Pool[]} poolList
     * @param {number} smartRouteDepth
     * @returns Graph instance
     */
    graphPools(poolList: any, smartRouteDepth?: number): Graph;
    _processTokenForPath(tokenName: any): any[];
    getPairPaths(token0: any, token1: any): any;
    getOutInPrice(inAmt: any, outAmt: any): number;
    getSwaps(): any[];
    getPoolByTokens(tokenA: any, tokenB: any): Pool;
}
//# sourceMappingURL=Router.d.ts.map