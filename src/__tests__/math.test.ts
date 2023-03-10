import HashMap from 'hashmap'
import { Investor, UsdcToken, Router, Pool, Quest } from '../modules'
import {
    buySameLiqGiveT0GetT1,
    buySameLiqGiveT1GetT0,
    getSwapAmtSameLiq,
    oneShotGetBuyCap,
    oneShotGetSellCap,
    sellSameLiqGiveT0GetT1,
    sellSameLiqGiveT1GetT0
} from '../utils/mathUtils'
import { getCP, getQP } from './helpers/getQuestPools'

describe('Smart route math works', () => {
    let quests: any = {}
    let pools: any = {}
    let router
    const shouldDebugRouter = false

    const createRouter = (questObj, poolsObj, isDbg = shouldDebugRouter) => {
        const poolsHashMap = new HashMap(
            Object.entries(pools as Array<Pool>).map(([, obj]) => [
                obj.name,
                obj
            ])
        )
        const questsHashMap = new HashMap(
            Object.entries(quests as Array<Quest>).map(([, obj]) => [
                obj.name,
                obj
            ])
        )

        return new Router(questsHashMap, poolsHashMap, isDbg)
    }

    beforeEach(() => {
        const { quest: questA, pool: poolA } = getQP('A', 1000000)
        const { quest: questB, pool: poolB } = getQP('B', 1000000)
        const { quest: questC, pool: poolC } = getQP('C', 1000000)
        const { quest: questD, pool: poolD } = getQP('D', 1000000)
        quests.A = questA
        quests.B = questB
        quests.C = questC
        quests.D = questD
        pools.A = poolA
        pools.B = poolB
        pools.C = poolC
        pools.D = poolD
    })

    it('oneShotGetBuyCap() / oneShotGetSellCap()', () => {
        const investor = Investor.create('INV', 'INV', 10000)

        pools.A.buy(25000)
        pools.A.buy(555555)
        pools.B.buy(1480)
        pools.B.buy(5000)
        pools.C.buy(650)

        const { crossPool: poolAB } = getCP(
            quests.B,
            quests.A,
            pools.B,
            pools.A,
            0,
            100
        )
        pools.AB = poolAB

        const { crossPool: poolCB } = getCP(
            quests.C,
            quests.B,
            pools.C,
            pools.B,
            0,
            100
        )
        pools.AB = poolAB
        pools.CB = poolCB

        const drySumAB = pools.AB.dryBuy(Infinity)

        const [_liq1, _price1, _next1] = poolAB.getNearestActiveLiq(true)
        expect(oneShotGetBuyCap(_liq1, _price1, _next1)).toEqual([
            Math.abs(drySumAB[0]),
            Math.abs(drySumAB[1])
        ])

        const [_liq2, _price2, _next2] = poolAB.getNearestActiveLiq(false)
        expect(oneShotGetSellCap(_liq2, _price2, _next2)).toEqual([0, 0])

        // Flipping the pool
        poolAB.buy(100)

        const [_liq3, _price3, _next3] = poolAB.getNearestActiveLiq(false)
        expect(oneShotGetSellCap(_liq3, _price3, _next3)).toEqual([
            Math.abs(drySumAB[1]),
            Math.abs(drySumAB[0])
        ])

        // flipping the pool
        pools.A.buy(Infinity)
        const [_liq4, _price4, _next4] = pools.A.getNearestActiveLiq(false)
        expect(oneShotGetSellCap(_liq4, _price4, _next4)).toEqual([
            5000.000000000001, 70710678.11865474
        ])

        // flipping the pool
        pools.A.sell(1000000000)
        const [_liq5, _price5, _next5] = pools.A.getNearestActiveLiq(true)
        expect(oneShotGetBuyCap(_liq5, _price5, _next5)).toEqual([
            17378.057832830727, 3885.8518631132183
        ])
    })

    it('buySameLiqGiveT1GetT0() / buySameLiqGiveT0GetT1()', () => {
        const investor = Investor.create('INV', 'INV', 10000)

        pools.A.buy(25000)
        pools.A.buy(555555)
        pools.B.buy(1480)
        pools.B.buy(5000)
        pools.C.buy(650)

        const { crossPool: poolAB } = getCP(
            quests.B,
            quests.A,
            pools.B,
            pools.A,
            0,
            100
        )
        pools.AB = poolAB

        const [_liq1, _price1, _next1] = pools.AB.getNearestActiveLiq(true)
        const buyCap = oneShotGetBuyCap(_liq1, _price1, _next1)

        // GiveT1GetT0
        expect(buySameLiqGiveT1GetT0(_liq1, _price1, buyCap[1])).toBeCloseTo(
            buyCap[0],
            5
        )
        // GiveT0GetT1
        expect(buySameLiqGiveT0GetT1(_liq1, _price1, buyCap[0])).toBeCloseTo(
            buyCap[1],
            5
        )
    })

    it('sellSameLiqGiveT0GetT1() / sellSameLiqGiveT1GetT0()', () => {
        const investor = Investor.create('INV', 'INV', 10000)

        pools.A.buy(25000)
        pools.A.buy(555555)
        pools.B.buy(1480)
        pools.B.buy(5000)
        pools.C.buy(650)

        const { crossPool: poolAB } = getCP(
            quests.B,
            quests.A,
            pools.B,
            pools.A,
            0,
            100
        )
        pools.AB = poolAB

        // flipping the pool
        poolAB.buy(Infinity)

        const [_liq1, _price1, _next1] = pools.AB.getNearestActiveLiq(false)
        const sellCap = oneShotGetSellCap(_liq1, _price1, _next1)

        // GiveT0GetT1
        expect(sellSameLiqGiveT0GetT1(_liq1, _price1, sellCap[1])).toBeCloseTo(
            sellCap[0],
            5
        )
        // GiveT1GetT0
        expect(sellSameLiqGiveT1GetT0(_liq1, _price1, sellCap[0])).toBeCloseTo(
            sellCap[1],
            5
        )
    })

    it('getSwapAmtSameLiq', () => {
        const investor = Investor.create('INV', 'INV', 10000)

        pools.A.buy(25000)
        pools.A.buy(555555)
        pools.B.buy(1480)
        pools.B.buy(5000)
        pools.C.buy(650)

        const { crossPool: poolAB } = getCP(
            quests.B,
            quests.A,
            pools.B,
            pools.A,
            0,
            100
        )
        pools.AB = poolAB

        const swapAmts = getSwapAmtSameLiq(poolAB, true)
        expect(swapAmts.t0fort1).toBeCloseTo(3.550728855619723, 5)
        expect(swapAmts.t1fort0).toBe(100)

        // flip the pool
        poolAB.buy(100)
        const swapAmtsSell = getSwapAmtSameLiq(poolAB, false)
        expect(swapAmtsSell.t0fort1).toBeCloseTo(3.550728855619723, 5)
        expect(swapAmtsSell.t1fort0).toBeCloseTo(100)

        const swapAmtsBuyD = getSwapAmtSameLiq(pools.D, true)
        expect(swapAmtsBuyD.t0fort1).toBeCloseTo(17378.057832830727, 5)
        expect(swapAmtsBuyD.t1fort0).toBeCloseTo(3885.8518631132183, 5)

        // we buy a fraction less, otherwise we'll active next position
        pools.D.buy(swapAmtsBuyD.t0fort1 - 0.000000001)

        const swapAmtsBuyDsell = getSwapAmtSameLiq(pools.D, false)
        expect(swapAmtsBuyDsell.t0fort1).toBeCloseTo(17378.057832830727, 5)
        expect(swapAmtsBuyDsell.t1fort0).toBeCloseTo(3885.8518631132183, 5)

        pools.D.buy(Infinity)
        const swapAmtsBuyD_flipped = getSwapAmtSameLiq(pools.D, true)
        expect(swapAmtsBuyD_flipped.t0fort1).toBeCloseTo(70710678.11865559, 5)
        expect(swapAmtsBuyD_flipped.t1fort0).toBeCloseTo(5000.0, 5)

        const swapAmtsSellD_flipped = getSwapAmtSameLiq(pools.D, false)
        expect(swapAmtsSellD_flipped.t0fort1).toBeCloseTo(70710678.11865474, 5)
        expect(swapAmtsSellD_flipped.t1fort0).toBeCloseTo(5000.000000000033, 5)

        // flip the pool backwards
        pools.D.sell(Infinity)
        const swapAmtsSellD_flipped_bw = getSwapAmtSameLiq(pools.D, false)
        expect(swapAmtsSellD_flipped_bw.t0fort1).toBeCloseTo(0, 5)
        expect(swapAmtsSellD_flipped_bw.t1fort0).toBeCloseTo(0, 5)

        const swapAmtsBuyD_flipped_bw = getSwapAmtSameLiq(pools.D, true)
        expect(swapAmtsBuyD_flipped_bw.t0fort1).toBeCloseTo(
            17378.057832830727,
            5
        )
        expect(swapAmtsBuyD_flipped_bw.t1fort0).toBeCloseTo(
            3885.8518631132183,
            5
        )
    })
})

describe.skip('Basic math works', () => {
    let quests
    let pools

    beforeEach(() => {
        quests = new HashMap()
        pools = new HashMap()
    })

    it('Buys out the entire quest  pool without triggering surplus function', () => {
        const { pool } = getQP('AGORA', 1000000)

        const res = pool.buy(1000000000)
        expect(res[0]).toBeCloseTo(-133426696.95, 2)
        expect(res[1]).toBe(20000)
    })

    it('Sells out the entire quest  pool without triggering surplus function', () => {
        const { pool } = getQP('AGORA', 1000000)

        pool.buy(1000000000)
        const res = pool.sell(1000000000)
        expect(res[0]).toBeCloseTo(-20000)
        expect(res[1]).toBeCloseTo(133426696.95, 2)
    })

    it('Buys out the entire quest pool without triggering surplus function via smart route', () => {
        const { quest, pool } = getQP('AGORA')

        quests.set(quest.name, quest)
        quests.set('USDC', new UsdcToken())

        pools.set(pool.name, pool)

        const router = new Router(quests, pools)
        const res = router.smartSwap('USDC', 'AGORA', 1000000000)

        expect(res[0]).toBeCloseTo(-13342669.695, 3)
        expect(res[1]).toBeCloseTo(20000)
    })

    it('Sells out the entire quest pool without triggering surplus function via smart route', () => {
        const { quest, pool } = getQP('AGORA')

        quests.set(quest.name, quest)
        quests.set('USDC', new UsdcToken())

        pools.set(pool.name, pool)

        const router = new Router(quests, pools)

        router.smartSwap('USDC', 'AGORA', 1000000000)
        const res = router.smartSwap('AGORA', 'USDC', 1000000000)

        expect(res[0]).toBeCloseTo(-20000, 0)
        expect(res[1]).toBeCloseTo(13342669.695, 3)
    })

    it('Buys out the entire cross pool with 1:1 price', () => {
        const { quest: qAGORA, pool: AGORA } = getQP('AGORA')
        const { quest: qTEST, pool: TEST } = getQP('TEST')

        const { crossPool: AGORA_TEST } = getCP(
            qTEST,
            qAGORA,
            TEST,
            AGORA,
            0,
            50.5
        )

        const res = AGORA_TEST.buy(1000)
        expect(res[0]).toBeCloseTo(-71.417, 2)
        expect(res[1]).toBeCloseTo(50.5, 1)
    })

    it('Sells out the entire cross pool with 1:1 price', () => {
        const { quest: qAGORA, pool: AGORA } = getQP('AGORA')
        const { quest: qTEST, pool: TEST } = getQP('TEST')

        const { crossPool: AGORA_TEST } = getCP(
            qTEST,
            qAGORA,
            TEST,
            AGORA,
            0,
            50.5
        )

        AGORA_TEST.buy(1000)
        const res = AGORA_TEST.sell(1000)
        expect(res[0]).toBeCloseTo(-50.5, 1)
        expect(res[1]).toBeCloseTo(71.417, 2)
    })

    it('Doesnt buy anything at the end of the quest pool', () => {})
    it('Doesnt buy anything at the end of the cross pool with price 1:1 pool', () => {})
    it('Doesnt buy anything at the end of the cross pool with cited higher than citing pool', () => {})
    it('Doesnt buy anything at the end of the cross pool with citing higher than cited pool', () => {})

    it('Doesnt sell anything at the end of the quest pool', () => {})
    it('Doesnt sell anything at the end of the cross pool with price 1:1 pool', () => {})
    it('Doesnt sell anything at the end of the cross pool with cited higher than citing pool', () => {})
    it('Doesnt sell anything at the end of the cross pool with citing higher than cited pool', () => {})

    it('Doesnt buy anything at the end of the quest pool via smart route', () => {})
    it('Doesnt buy anything at the end of the cross pool with price 1:1 pool via smart route', () => {})
    it('Doesnt buy anything at the end of the cross pool with cited higher than citing pool via smart route', () => {})
    it('Doesnt buy anything at the end of the cross pool with citing higher than cited pool via smart route', () => {})

    it('Doesnt sell anything at the end of the quest pool via smart route', () => {})
    it('Doesnt sell anything at the end of the cross pool with price 1:1 pool via smart route', () => {})
    it('Doesnt sell anything at the end of the cross pool with cited higher than citing pool via smart route', () => {})
    it('Doesnt sell anything at the end of the cross pool with citing higher than cited pool via smart route', () => {})

    it('Buys out the entire cross pool with price 1:1 via smart route', () => {
        const { quest: qAGORA, pool: AGORA } = getQP('AGORA')
        const { quest: qTEST, pool: TEST } = getQP('TEST')

        const { crossPool: AGORA_TEST } = getCP(
            qTEST,
            qAGORA,
            TEST,
            AGORA,
            0,
            50.5
        )

        quests.set(qAGORA.name, qAGORA)
        quests.set(qTEST.name, qTEST)
        quests.set('USDC', new UsdcToken())

        pools.set(AGORA.name, AGORA)
        pools.set(TEST.name, TEST)
        pools.set(AGORA_TEST.name, AGORA_TEST)

        const router = new Router(quests, pools)

        const res = router.smartSwap('AGORA', 'TEST', 1000)
        expect(res[0]).toBeCloseTo(-71.417, 2)
        expect(res[1]).toBeCloseTo(50.5, 1)
    })

    it('Sells out the entire cross pool with price 1:1 via smart route', () => {
        const investor = Investor.create('INV', 'INV', 10000)
        // Assume path: USDC-Praseodymium (5)-AGORA-Praseodymium (3)
        const { quest: qTST3, pool: TST3 } = getQP('TEST_1', 1000000)
        const { quest: qTST5, pool: TST5 } = getQP('TEST_2', 1000000)
        const { quest: qAGORA, pool: AGORA } = getQP('AGORA', 1000000)

        AGORA.buy(25000)

        AGORA.buy(555555)
        TST3.buy(1480)
        TST5.buy(5000)
        TST5.buy(650)

        const { crossPool: AGORA_TST3 } = getCP(
            qTST3,
            qAGORA,
            TST3,
            AGORA,
            0,
            50.025
        )
        const priceRange = investor.calculatePriceRange(
            AGORA_TST3,
            AGORA,
            TST3,
            2
        )
        console.log(priceRange)

        investor.citeQuest(
            AGORA_TST3,
            priceRange.min,
            priceRange.max,
            0,
            12000,
            priceRange.native
        )
        console.log(AGORA_TST3)
        const { crossPool: AGORA_TST5 } = getCP(
            qTST5,
            qAGORA,
            TST5,
            AGORA,
            0,
            100.06
        )

        // console.log(
        //     'dry swap formula',
        //     getMaxOneShotBuy(
        //         AGORA_TST3.curLiq,
        //         AGORA_TST3.curPrice,
        //         AGORA_TST3.curRight
        //     )
        // )
        //
        // console.log(
        //     'how much I need to pay for 50.025',
        //     maxSameLiqBuyIn(AGORA_TST3.curLiq, AGORA_TST3.curPrice, 50.025)
        // )
        // console.log(
        //     'how much I need to pay for 0.566',
        //     maxSameLiqBuyOut(AGORA_TST3.curLiq, AGORA_TST3.curPrice, 0.566)
        // )

        const pools = new HashMap()
        const quests = new HashMap()
        pools.set(AGORA.name, AGORA)
        pools.set(TST3.name, TST3)
        pools.set(TST5.name, TST5)
        pools.set(AGORA_TST3.name, AGORA_TST3)
        pools.set(AGORA_TST5.name, AGORA_TST5)

        quests.set(qTST3.name, qTST3)
        quests.set(qAGORA.name, qAGORA)
        quests.set(qTST5.name, qTST5)
        quests.set('USDC', new UsdcToken())

        const router = new Router(quests, pools)

        console.log(router.smartSwap('USDC', qTST5.name, 2000))
    })

    it('After opening a position on drained cross pool it opens with correct price range', () => {})

    it('When selling out drained pool it correctly sets active position', () => {
        expect(0).toBe(1)
    })

    it('Left position - When opening a new position with lower priceMin than curPrice and price shift is free - do the change to another active liquidity', () => {
        expect(0).toBe(1)
    })

    it('Right position - When opening a new position with lower priceMin than curPrice and price shift is free - do the change to another active liquidity', () => {
        expect(0).toBe(1)
    })

    it('Never sells tokens that do not exist in the pool', () => {
        expect(0).toBe(1)
    })

    it('Never consumes more than it can exchange for during swap', () => {
        expect(0).toBe(1)
    })

    it('Properly exists when 0 is passed to buy/sell', () => {
        expect(0).toBe(1)
    })

    it('Properly exists when NaN is passed to buy/sell', () => {
        expect(0).toBe(1)
    })

    it('Properly exists when during buy/sell calculation it got to NaN', () => {
        expect(0).toBe(1)
    })
})
