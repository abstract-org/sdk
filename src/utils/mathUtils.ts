/**
 * @description Unites all formula functions to produce exact amount in and out that can be traded in the pool given amountIn as a target
 * @param {Pool} poolRef
 * @param {boolean} zeroForOne
 */
export const getSwapAmtSameLiq = (poolRef, zeroForOne = true) => {
    let liq = poolRef.curLiq
    let price = poolRef.curPrice
    let next = zeroForOne ? poolRef.curRight : poolRef.curPP
    let capSwap

    // find active liq if none
    if (liq === 0) {
        const nextActiveLiqPos = poolRef.getNearestActiveLiq(zeroForOne)

        if (!nextActiveLiqPos) {
            return {
                t0fort1: 0,
                t1fort0: 0,
                msg: 'No next active liquidity found'
            }
        }

        ;[liq, price, next] = [...nextActiveLiqPos]
    }

    // get one shot same liq
    let sameLiqAmts
    if (zeroForOne) {
        // get max one shots (caps)
        capSwap = oneShotGetBuyCap(liq, price, next)
        sameLiqAmts = getBuySameLiq(liq, price, capSwap[0], capSwap[1])
    } else {
        // get max one shots (caps)
        capSwap = oneShotGetSellCap(liq, price, next)
        sameLiqAmts = getSellSameLiq(liq, price, capSwap[0], capSwap[1])
    }

    // return total amount per liquidity in designated pool
    return sameLiqAmts
}
/**
 *
 * @param {number} liq
 * @param {number} price
 * @param {number} nextPP // log2
 * @returns {array[[number, number], [number, number]]}
 */
export const oneShotGetBuyCap = (liq, price, nextPP) => {
    return [
        Math.abs(buyOneShotGetT0cap(liq, price, nextPP)),
        Math.abs(buyOneShotGetT1cap(liq, price, nextPP))
    ]
}
export const oneShotGetSellCap = (liq, price, nextPP) => {
    return [
        Math.abs(sellOneShotGetT1cap(liq, price, nextPP)),
        Math.abs(sellOneShotGetT0cap(liq, price, nextPP))
    ]
}

const buyOneShotGetT0cap = (liq, price, nextPP) => {
    return liq * (Math.sqrt(2 ** nextPP) - Math.sqrt(price))
}
const buyOneShotGetT1cap = (liq, price, nextPP) => {
    return liq * (1 / Math.sqrt(2 ** nextPP) - 1 / Math.sqrt(price))
}

const sellOneShotGetT1cap = (liq, price, nextPP) => {
    return liq * (1 / Math.sqrt(price) - 1 / Math.sqrt(2 ** nextPP))
}
const sellOneShotGetT0cap = (liq, price, nextPP) => {
    return liq * (Math.sqrt(price) - Math.sqrt(2 ** nextPP))
}

export const getBuySameLiq = (liq, price, t0amt, t1amt) => {
    return {
        t0fort1: buySameLiqGiveT1GetT0(liq, price, t1amt),
        t1fort0: buySameLiqGiveT0GetT1(liq, price, t0amt)
    }
}

export const getSellSameLiq = (liq, price, t1amt, t0amt) => {
    return {
        t1fort0: sellSameLiqGiveT0GetT1(liq, price, t0amt),
        t0fort1: sellSameLiqGiveT1GetT0(liq, price, t1amt)
    }
}

/**
 * @description [exactOut] Returns how many token0 will be consumed for specified amount within the same liquidity
 * @param {number} liq
 * @param {number} price
 * @param {number} amount
 * @returns
 */
export const buySameLiqGiveT1GetT0 = (liq, price, amount) => {
    return Math.abs(
        (liq * price * amount) / (liq + Math.sqrt(price) * (amount * -1))
    )
}

/**
 * @description [exactIn] Returns how many token1 will be received for specified amount of token0 within the same liquidity
 * @param {number} liq
 * @param {number} price
 * @param {number} amount
 * @returns
 */
export const buySameLiqGiveT0GetT1 = (liq, price, amount) => {
    return Math.abs(
        liq * (1 / (Math.sqrt(price) + amount / liq) - 1 / Math.sqrt(price))
    )
}

/**
 * @description [exactIn] Returns how many token1 will be consumed for specified amount within the same liquidity
 * @param {number} liq
 * @param {number} price
 * @param {number} amount
 * @returns
 */
export const sellSameLiqGiveT0GetT1 = (liq, price, amount) => {
    return Math.abs((liq * amount) / (liq * price - Math.sqrt(price) * amount))
}

/**
 * @description [exactOut] Returns how many token0 will be received for specified amount of token1 within the same liquidity
 * @param {number} liq
 * @param {number} price
 * @param {number} amount
 * @returns
 */
export const sellSameLiqGiveT1GetT0 = (liq, price, amount) => {
    return Math.abs(
        liq * (Math.sqrt(price) - liq / (amount + liq / Math.sqrt(price)))
    )
}
