import { Investor, UsdcToken } from '../../modules'

export const getQP = (name, priceMax = 10000) => {
    const investor = Investor.create('INV', 'INV', 10000)

    const quest = investor.createQuest(name)
    const pool = quest.createPool({
        tokenLeft: new UsdcToken(),
        initialPositions: [
            { priceMin: 1, priceMax, tokenA: 0, tokenB: 5000 },
            { priceMin: 20, priceMax, tokenA: 0, tokenB: 5000 },
            { priceMin: 50, priceMax, tokenA: 0, tokenB: 5000 },
            {
                priceMin: 200,
                priceMax,
                tokenA: 0,
                tokenB: 5000
            }
        ]
    })

    return { quest, pool }
}

export const getCP = (
    citingQ,
    citedQ,
    citingP,
    citedP,
    citedSumA = 0,
    citedSumB = 0
) => {
    const investor = Investor.create('INV', 'INV', 10000)
    const startingPrice = citingP.curPrice / citedP.curPrice
    const AB = investor.createPool(citedQ, citingQ, startingPrice)
    citedQ.addPool(AB)
    citingQ.addPool(AB)

    const priceRange = investor.calculatePriceRange(AB, citedP, citingP, 2)
    investor.citeQuest(
        AB,
        priceRange.min,
        priceRange.max,
        citedSumA,
        citedSumB,
        priceRange.native
    )

    return { crossPool: AB }
}

export const getPoolCurrentPointers = (poolRef) => {
    const curPointers = {
        curLiq: poolRef.curLiq,
        curPrice: poolRef.curPrice,
        curLeft: poolRef.curLeft,
        curPP: poolRef.curPP,
        curRight: poolRef.curRight
    }

    return curPointers
}
