import HashMap from 'hashmap'
import { Wallet, UsdcToken, Router } from '../common/modules'
import { getCP, getQP } from './helpers/getQuestPools'
import { preparePool } from './helpers/poolManager'

const TEMP_CONFIG = {
    PRICE_MAX: 1000000.00001
}

const initialPositions = [
    {
        priceMin: 1,
        priceMax: 10000,
        tokenB: 5000,
        tokenA: null
    },
    {
        priceMin: 20,
        priceMax: 10000,
        tokenB: 5000,
        tokenA: null
    },
    {
        priceMin: 50,
        priceMax: 10000,
        tokenB: 5000,
        tokenA: null
    },
    {
        priceMin: 200,
        priceMax: 10000,
        tokenB: 5000,
        tokenA: null
    }
]

describe('Selling', () => {
    it('Sells fractions directly', () => {
        const { quest: questA, pool: A } = getQP('A')

        A.buy(100000)

        const res = A.sell(0.01)

        expect(res[0]).toBeCloseTo(-0.0099, 0)
        expect(res[1]).toBeCloseTo(0.518, 0)
    })

    it('Sells fractions into cross pool directly', () => {})

    it('Sells fractions via smart route', () => {})
})

describe('Cross Pool swapping', () => {
    const initialPositions = [
        {
            priceMin: 1,
            priceMax: 10000,
            tokenB: 5000,
            tokenA: null
        },
        {
            priceMin: 20,
            priceMax: 10000,
            tokenB: 5000,
            tokenA: null
        },
        {
            priceMin: 50,
            priceMax: 10000,
            tokenB: 5000,
            tokenA: null
        },
        {
            priceMin: 200,
            priceMax: 10000,
            tokenB: 5000,
            tokenA: null
        }
    ]

    it('Sells expensive cited token into cross pool for the right amount', () => {
        const { quest: questA, pool: A } = getQP('A')
        const { quest: questB, pool: B } = getQP('B')
        const { quest: questC, pool: C } = getQP('C')

        A.buy(5000)
        B.buy(500000)
        C.buy(5000)

        const { crossPool: BA } = getCP(questA, questB, A, B, 0, 100)
        const { crossPool: CB } = getCP(questB, questC, B, C, 0, 300)

        const pools = new HashMap()
        const quests = new HashMap()

        pools.set(A.name, A)
        pools.set(B.name, B)
        pools.set(C.name, C)
        pools.set(BA.name, BA)
        pools.set(CB.name, CB)

        quests.set(questA.name, questA)
        quests.set(questB.name, questB)
        quests.set(questC.name, questC)
        quests.set('USDC', new UsdcToken())

        const router = new Router(quests, pools)
        const swap = router.smartSwap('USDC', 'A', 1000)
        expect(swap[0]).toBeCloseTo(-1000, 0)
        expect(swap[1]).toBeCloseTo(229.66, 1)
    })
})

it('Does micro price buy properly within the same liquidity', () => {
    const { pool, wallet, tokenLeft, tokenRight } = preparePool(
        20001,
        'wallet',
        initialPositions
    )
    const [totalAmountIn, totalAmountOut] = pool.buy(0.000001)
    wallet.addBalance(tokenLeft.name, totalAmountIn)
    wallet.addBalance(tokenRight.name, totalAmountOut)

    expect(pool.curLiq).toBeCloseTo(5050.505)
    expect(pool.totalSold).toBeCloseTo(0.000001)
    expect(pool.curPrice).toBeCloseTo(1)
})

it('Does mini price buy properly within the same liquidity', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)
    pool.buy(1)

    expect(pool.curLiq).toBeCloseTo(5050.505)
    expect(pool.totalSold).toBeCloseTo(1)
    expect(pool.curPrice).toBeCloseTo(1)
})

it('Does mini price buy properly while jumping liquidity', () => {
    const { pool } = preparePool(100000, 'wallet', initialPositions)
    pool.buy(17500)

    expect(pool.curPrice).toBeCloseTo(19.9, 0)
    expect(pool.curLiq).toBeCloseTo(5050.505)
    expect(pool.totalSold).toBeCloseTo(3919, 0)

    pool.buy(500)
    expect(pool.curLiq).toBeCloseTo(28458, 0)
    expect(pool.curPrice).toBeCloseTo(20, 0)
})

it('Tries to buy over limit', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)
    pool.buy(150000000)
    const [totalIn, totalOut] = pool.buy(20000)

    expect(totalIn).toBe(0)
    expect(totalOut).toBe(0)
    expect(pool.curLiq).toBe(0)
    expect(pool.totalSold).toBe(20000)
    expect(pool.curPrice).toBeCloseTo(999999.999)
})

it('Does micro price sell properly within the same liquidity', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)
    pool.buy(2)
    const [totalAmountIn, totalAmountOut] = pool.sell(1)

    // console.log(pool, totalAmountIn, totalAmountOut)
    expect(pool.curLiq).toBeCloseTo(5050.505)
    expect(pool.totalSold).toBeCloseTo(1)
    expect(pool.curPrice).toBeCloseTo(1)
    expect(totalAmountIn).toBeCloseTo(-1)
    expect(totalAmountOut).toBeCloseTo(1)
})

it('Dry buy all', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)

    const [totalIn, totalOut] = pool.dryBuy(1000000000)
    expect(totalIn).toBeCloseTo(-13342669.6, 0)
    expect(totalOut).toBeCloseTo(20000)
})

it('Dry sell all', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)

    pool.buy(10000000000)
    const [totalIn, totalOut] = pool.drySell(1000000000)
    expect(totalIn).toBeCloseTo(-20000)
    expect(totalOut).toBeCloseTo(13342669.6, 0)
})

it('Does micro price sell properly while jumping liquidity', () => {
    const { pool } = preparePool(100000, 'wallet', initialPositions)
    pool.buy(17530)
    expect(pool.curPrice).toBeCloseTo(19.9, 0)

    pool.buy(10)
    expect(pool.curPrice).toBeCloseTo(20)

    expect(pool.curLiq).toBeCloseTo(28457.9, 0)
    expect(pool.totalSold).toBeCloseTo(3921, 0)

    pool.sell(1)
    expect(pool.curLiq).toBeCloseTo(5050.505)
    expect(pool.totalSold).toBeCloseTo(3920, 0)
    expect(pool.curPrice).toBeCloseTo(19.97, 0)
})

it('Tries to sell over limit', () => {
    const { pool, wallet, tokenLeft, tokenRight } = preparePool(
        10000,
        'wallet',
        initialPositions
    )
    const [a1in, a1out] = pool.buy(1000000000)
    expect(pool.totalSold).toBeCloseTo(20000)

    expect(a1in).toBeCloseTo(-13342669.6, 0)
    expect(a1out).toBeCloseTo(20000)

    const [a1_1in, a1_1out] = pool.buy(30)
    expect(a1_1in).toBe(0)
    expect(a1_1out).toBe(0)

    const [a2in, a2out] = pool.sell(30000)
    expect(a2out).toBeCloseTo(13342669.6, 0)
    expect(a2in).toBeCloseTo(-20000)

    const [a3in, a3out] = pool.sell(10)
    expect(a3out).toBe(0)
    expect(a3in).toBe(0)
    expect(pool.curRight).toBe(0)

    const [a4in, a4out] = pool.buy(300)
    expect(a4in).toBeCloseTo(-300)
    expect(a4out).toBeCloseTo(283.179)

    const [a5in, a5out] = pool.buy(1000000000)
    expect(a5in).toBeCloseTo(-13342369.6, 0)
    expect(a5out).toBeCloseTo(20000 - a4out)

    const [a6in, a6out] = pool.buy(10)
    expect(a6in).toBe(0)
    expect(a6out).toBe(0)

    const [a7in, a7out] = pool.sell(20000)
    expect(a7out).toBeCloseTo(13342669.6, 0)
    expect(a7in).toBeCloseTo(-20000)

    const [a8in, a8out] = pool.sell(20)
    expect(a8in).toBeCloseTo(0)
    expect(a8out).toBeCloseTo(0)

    const [a9in, a9out] = pool.buy(1000000000)
    expect(a9in).toBeCloseTo(-13342669.6, 0)
    expect(a9out).toBeCloseTo(20000)

    const [a10in, a10out] = pool.buy(10)
    expect(a10in).toBe(0)
    expect(a10out).toBe(0)

    const [a11in, a11out] = pool.sell(20000)
    expect(a11out).toBeCloseTo(13342669.6, 0)
    expect(a11in).toBeCloseTo(-20000)

    const [a12in, a12out] = pool.sell(20)
    expect(a12in).toBeCloseTo(0)
    expect(a12out).toBeCloseTo(0)

    const [a13in, a13out] = pool.buy(13342669)
    expect(a13in).toBeCloseTo(-13342669, 0)
    expect(a13out).toBeCloseTo(19999.999)

    const [a14in, a14out] = pool.sell(19999)
    expect(a14in).toBeCloseTo(-19999)
    expect(a14out).toBeCloseTo(13342667.9, 0)

    expect(pool.curLiq).toBeCloseTo(5050.505)
    expect(pool.totalSold).toBeCloseTo(0.999)
    expect(pool.curPrice).toBeCloseTo(1.0)
})

it('swaps USDC for RP1 and updates current price', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)

    pool.buy(5000)
    expect(pool.curPrice).toBeCloseTo(3.96)

    pool.buy(10000)
    expect(pool.curPrice).toBeCloseTo(15.7, 0)
})

it('Buys until runs out of USDC', () => {
    const { pool, wallet, tokenLeft, tokenRight } = preparePool(
        20001,
        'wallet',
        initialPositions
    )

    let [totalAmountIn, totalAmountOut] = pool.buy(5000)

    wallet.addBalance(tokenLeft.name, totalAmountIn)
    wallet.addBalance(tokenRight.name, totalAmountOut)

    const leftBalance = wallet.balances[tokenLeft.name]
    const rightBalance = wallet.balances[tokenRight.name]

    expect(leftBalance).toBe(15001)
    expect(rightBalance).toBeCloseTo(2512.562, 0)

    let [totalAmountIn2, totalAmountOut2] = pool.buy(5000)
    wallet.addBalance(tokenLeft.name, totalAmountIn2)
    wallet.addBalance(tokenRight.name, totalAmountOut2)

    expect(wallet.balances[tokenLeft.name]).toBe(10001)
    expect(wallet.balances[tokenRight.name]).toBeCloseTo(3356, 0)

    let [totalAmountIn3, totalAmountOut3] = pool.buy(5000)
    wallet.addBalance(tokenLeft.name, totalAmountIn3)
    wallet.addBalance(tokenRight.name, totalAmountOut3)

    expect(wallet.balances[tokenLeft.name]).toBeCloseTo(5001)
})

it('Three wallets one tick (buy during liquidity shift)', () => {
    const { pool, wallet, tokenLeft, tokenRight } = preparePool(
        10000,
        'wallet',
        initialPositions
    )
    const longTerm = Wallet.create('long-term', 'long-term', 1000000)
    const fomo = Wallet.create('fomo', 'fomo', 1000, true)

    let [totalAmountIn, totalAmountOut] = pool.buy(5000)
    wallet.addBalance(tokenLeft.name, totalAmountIn)
    wallet.addBalance(tokenRight.name, totalAmountOut)

    let [totalAmountIn2, totalAmountOut2] = pool.buy(5000)
    longTerm.addBalance(tokenLeft.name, totalAmountIn2)
    longTerm.addBalance(tokenRight.name, totalAmountOut2)

    let [totalAmountIn3, totalAmountOut3] = pool.buy(1000)
    fomo.addBalance(tokenLeft.name, totalAmountIn3)
    fomo.addBalance(tokenRight.name, totalAmountOut3)

    expect(fomo.balances[pool.tokenLeft]).toBe(0)
    expect(fomo.balances[pool.tokenRight]).toBeCloseTo(106, 0)
})

it('Buy all the way to the right', () => {
    const { pool, wallet, tokenLeft, tokenRight } = preparePool(
        10000,
        'wallet',
        initialPositions
    )

    pool.buy(10000000000000000)

    expect(pool.curPrice).toBeLessThanOrEqual(TEMP_CONFIG.PRICE_MAX)
    expect(pool.totalSold).toBe(20000)
    expect(pool.curLiq).toBe(0)
})

it('Sell all the way to the left', () => {
    const { pool, wallet, tokenLeft, tokenRight } = preparePool(
        10000,
        'wallet',
        initialPositions
    )

    pool.buy(100000000)
    expect(pool.totalSold).toBe(20000)
    pool.sell(20000)
    expect(pool.totalSold).toBeCloseTo(0)
})

it('Swaps RP1 for USDC and updates current price', () => {
    const { pool, wallet, tokenLeft, tokenRight } = preparePool(
        10000,
        'wallet',
        initialPositions
    )

    let [totalAmountIn, totalAmountOut] = pool.buy(5000)
    wallet.addBalance(tokenLeft.name, totalAmountIn)
    wallet.addBalance(tokenRight.name, totalAmountOut)

    expect(pool.curPrice).toBeCloseTo(3.9601)

    let [totalAmountIn2, totalAmountOut2] = pool.sell(
        wallet.balances[tokenRight.name]
    )
    wallet.addBalance(tokenLeft.name, totalAmountOut2)
    wallet.addBalance(tokenRight.name, totalAmountIn2)

    expect(wallet.balances[pool.tokenLeft]).toBe(10000)
    expect(pool.curPrice).toBe(1)
})

it('buys with a price limit up to X within the same liquidity', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)

    let [totalAmountIn, totalAmountOut] = pool.buy(10000, 5)
    expect(totalAmountIn).toBeCloseTo(-6242.767)
    expect(totalAmountOut).toBeCloseTo(2791.85)
    expect(pool.curPrice).toBeCloseTo(5)
})

it('buys with a price limit up to X by jumping through liquidity', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)

    let [totalAmountIn, totalAmountOut] = pool.buy(20000, 11)
    expect(totalAmountIn).toBeCloseTo(-11700, 0)
    expect(totalAmountOut).toBeCloseTo(3527.7, 0)
    expect(pool.curPrice).toBeCloseTo(11)
})

it('sells with a price limit down to X', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)

    pool.buy(50000)
    expect(pool.totalSold).toBeCloseTo(5214, 0)

    let [totalAmountIn, totalAmountOut] = pool.sell(5000, 11)
    expect(totalAmountOut).toBeCloseTo(38299.8, 0)
    expect(totalAmountIn).toBeCloseTo(-1686.7, 0)
    expect(pool.curPrice).toBeCloseTo(11)
})

it('sells with a price limit down to X by jumping through liquidity', () => {
    const { pool } = preparePool(10000, 'wallet', initialPositions)

    pool.buy(50000)
    expect(pool.totalSold).toBeCloseTo(5214, 0)

    let [totalAmountIn, totalAmountOut] = pool.sell(5500, 5)
    expect(totalAmountOut).toBeCloseTo(43757.232)
    expect(totalAmountIn).toBeCloseTo(-2422.6, 0)
    expect(pool.curPrice).toBeCloseTo(5)
})

it('Calculates reserves properly by swapping in different directions in both USDC and cross pools', () => {
    const wallet = Wallet.create('creator', 'creator', 500000)
    const quest = wallet.createQuest('AGORA')
    const quest2 = wallet.createQuest('AGORA2')
    const quest3 = wallet.createQuest('AGORA3')
    const quest4 = wallet.createQuest('AGORA4')

    const pool = quest.createPool({ initialPositions })
    const pool2 = quest2.createPool({ initialPositions })
    const pool3 = quest3.createPool({ initialPositions })
    const pool4 = quest4.createPool({ initialPositions })

    pool.buy(10000000000000)

    pool2.buy(100000000000000)
    pool2.sell(10000000000000)

    pool3.buy(6000000)

    pool4.buy(100000000000000)
    pool4.sell(10000)

    const startingPrice1 = pool.curPrice / pool2.curPrice
    const BA = wallet.createPool(quest2, quest, startingPrice1)
    const priceRange1 = wallet.calculatePriceRange(BA, pool2, pool)
    wallet.citeQuest(BA, priceRange1.min, priceRange1.max, 0, 1000)
    quest.addPool(BA)
    quest2.addPool(BA)

    const startingPrice2 = pool.curPrice / pool3.curPrice
    const CA = wallet.createPool(quest3, quest, startingPrice2)
    const priceRange2 = wallet.calculatePriceRange(CA, pool, pool3)
    wallet.citeQuest(CA, priceRange2.min, priceRange2.max, 1000, 0)
    quest.addPool(CA)
    quest3.addPool(CA)

    const startingPrice3 = pool.curPrice / pool4.curPrice
    const AD = wallet.createPool(quest4, quest, startingPrice3)
    const priceRange3 = wallet.calculatePriceRange(AD, pool4, pool)
    wallet.citeQuest(AD, priceRange3.min, priceRange3.max, 1000, 600)
    quest.addPool(AD)
    quest4.addPool(AD)

    expect(Math.abs(pool.questRightVolume)).toBe(0)
    expect(Math.abs(pool.questLeftVolume)).toBeCloseTo(13342669.6, 0)
    expect(pool.curLiq).toBeCloseTo(0)

    expect(Math.abs(pool2.questLeftVolume)).toBeCloseTo(0)
    expect(Math.abs(pool2.questRightVolume)).toBe(20000)
    expect(pool2.curLiq).toBeCloseTo(0)

    expect(Math.abs(pool3.questLeftVolume)).toBeCloseTo(6000000)
    expect(Math.abs(pool3.questRightVolume)).toBeCloseTo(1448.9, 0)
    expect(pool3.curLiq).toBeCloseTo(148861, 0)

    expect(Math.abs(pool4.questLeftVolume)).toBeCloseTo(401950.6, 0)
    expect(Math.abs(pool4.questRightVolume)).toBeCloseTo(10000, 0)
    expect(pool4.curLiq).toBeCloseTo(66503.5, 0)

    expect(Math.abs(BA.questRightVolume)).toBe(1000)
    expect(Math.abs(BA.questLeftVolume)).toBe(0)

    // @TODO investigate why it fails for CA pool here
    // expect(Math.abs(CA.questRightVolume)).toBe(0)
    // expect(Math.abs(CA.questLeftVolume)).toBe(1000)

    expect(Math.abs(AD.questRightVolume)).toBeCloseTo(600)
    expect(Math.abs(AD.questLeftVolume)).toBeCloseTo(1000)
})
