/**
 * @description Unites all formula functions to produce exact amount in and out that can be traded in the pool given amountIn as a target
 * @param {Pool} poolRef
 * @param {boolean} zeroForOne
 */
export declare const getSwapAmtSameLiq: (poolRef: any, zeroForOne?: boolean) => any;
/**
 *
 * @param {number} liq
 * @param {number} price
 * @param {number} nextPP // log2
 * @returns {array[[number, number], [number, number]]}
 */
export declare const oneShotGetBuyCap: (liq: any, price: any, nextPP: any) => number[];
export declare const oneShotGetSellCap: (liq: any, price: any, nextPP: any) => number[];
export declare const getBuySameLiq: (liq: any, price: any, t0amt: any, t1amt: any) => {
    t0fort1: number;
    t1fort0: number;
};
export declare const getSellSameLiq: (liq: any, price: any, t1amt: any, t0amt: any) => {
    t1fort0: number;
    t0fort1: number;
};
/**
 * @description [exactOut] Returns how many token0 will be consumed for specified amount within the same liquidity
 * @param {number} liq
 * @param {number} price
 * @param {number} amount
 * @returns
 */
export declare const buySameLiqGiveT1GetT0: (liq: any, price: any, amount: any) => number;
/**
 * @description [exactIn] Returns how many token1 will be received for specified amount of token0 within the same liquidity
 * @param {number} liq
 * @param {number} price
 * @param {number} amount
 * @returns
 */
export declare const buySameLiqGiveT0GetT1: (liq: any, price: any, amount: any) => number;
/**
 * @description [exactIn] Returns how many token1 will be consumed for specified amount within the same liquidity
 * @param {number} liq
 * @param {number} price
 * @param {number} amount
 * @returns
 */
export declare const sellSameLiqGiveT0GetT1: (liq: any, price: any, amount: any) => number;
/**
 * @description [exactOut] Returns how many token0 will be received for specified amount of token1 within the same liquidity
 * @param {number} liq
 * @param {number} price
 * @param {number} amount
 * @returns
 */
export declare const sellSameLiqGiveT1GetT0: (liq: any, price: any, amount: any) => number;
//# sourceMappingURL=mathUtils.d.ts.map