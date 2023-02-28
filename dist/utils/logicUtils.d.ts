import HashMap from 'hashmap';
export declare const pp2p: (pricePoint: any) => number;
export declare const p2pp: (price: any) => number;
export declare const formSwapData: (pool: any, investor: any, action: any, totalAmountIn: any, totalAmountOut: any, paths: any, day: any, opName?: string) => {
    pool: any;
    price: any;
    investorHash: any;
    action: any;
    mcap: any;
    tvl: any;
    totalAmountIn: any;
    totalAmountOut: any;
    paths: any;
    day: any;
    opName: string;
};
export declare const getCombinedSwaps: (smSwaps: any, pools: any) => {};
export declare const byName: (name: any) => (item: any) => boolean;
export declare const formatBytes: (bytes: any, decimals?: number) => string;
export declare const sanitizeRemoteScenario: (loadedObj: any) => any;
export declare const isE10Zero: (amount: any) => boolean;
export declare const isNearZero: (amount: any) => boolean;
export declare const calcGrowthRate: (curr: any, prev: any) => number;
export declare const priceDiff: (price1: any, price2: any) => number;
export declare const getPathActions: (path: any, router: any) => any[];
export declare const hashmapToObj: (hm: any) => any;
export declare const isZero: (num: any) => boolean;
/**
 * @description Creates hashmap of mappings from array of objects
 * @param {Object[]} arr
 * @param {string} linkingKey - field name for mapping key
 * @param {string} linkingValue - field name for mapping value
 * @returns {HashMap}
 */
export declare function createHashMappings<T>(arr: Array<T>, linkingKey: string, linkingValue: any): HashMap<any, any>;
export declare function convertArrayToHashMapByKey(arr: Array<any>, key: string): HashMap<any, any>;
export declare const addStringToArrayUniq: (arr: any, str: any) => any[];
export declare const convertNumToFloat8: (value: any) => any;
export declare const convertFloat8ToNum: (value: any) => any;
export declare const inRangeFilter: (range: any) => (day: any) => boolean;
//# sourceMappingURL=logicUtils.d.ts.map