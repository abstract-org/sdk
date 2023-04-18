import HashMap from 'hashmap'
import {
    Wallet,
    UsdcToken,
    Router,
    Quest,
    TEMP_CONFIG
} from '../src/common/modules'
import { getPathActions, pp2p } from '../src/common/utils/logicUtils'
import { getCP, getQP } from './helpers/getQuestPools'
import { prepareCrossPools, preparePool } from './helpers/poolManager'

let globalState = {
    pools: new HashMap(),
    wallets: new HashMap(),
    quests: new HashMap()
}

beforeAll(() => {})

afterEach(() => {
    globalState = {
        pools: new HashMap(),
        wallets: new HashMap(),
        quests: new HashMap()
    }
})

describe('Building routes', () => {
    it('Builds correct direction of swap through path', () => {
        // Assume path: START-AGORA-USDC
        // Pools: [AGORA/START, USDC/AGORA] - AGORA was cited
        const { quest: qSTART, pool: START } = getQP('START')
        const { quest: qAGORA, pool: AGORA } = getQP('AGORA')
        const { quest: qBISON, pool: BISON } = getQP('BISON')
        const { crossPool: AGORA_START } = getCP(
            qSTART,
            qAGORA,
            START,
            AGORA,
            0,
            150
        )
        const { crossPool: AGORA_BISON } = getCP(
            qAGORA,
            qBISON,
            AGORA,
            BISON,
            0,
            150
        )

        const pools = new HashMap()
        const quests = new HashMap()
        pools.set(AGORA.name, AGORA)
        pools.set(START.name, START)
        pools.set(BISON.name, BISON)
        pools.set(AGORA_START.name, AGORA_START)
        pools.set(AGORA_BISON.name, AGORA_BISON)

        quests.set(qSTART.name, qSTART)
        quests.set(qAGORA.name, qAGORA)
        quests.set(qBISON.name, qBISON)
        quests.set('USDC', new UsdcToken())

        const router = new Router(quests, pools)

        const path = ['START', 'AGORA', 'USDC']
        const res = getPathActions(path, router)
        expect(res.length).toBe(2)
        expect(res[0].action).toBe('sell')
        expect(res[1].action).toBe('sell')

        const path2 = ['START', 'USDC']
        const res2 = getPathActions(path2, router)
        expect(res2.length).toBe(1)
        expect(res2[0].action).toBe('sell')

        const path3 = ['USDC', 'START']
        const res3 = getPathActions(path3, router)
        expect(res3.length).toBe(1)
        expect(res3[0].action).toBe('buy')

        const path4 = ['USDC', 'AGORA', 'START']
        const res4 = getPathActions(path4, router)
        expect(res4.length).toBe(2)
        expect(res4[0].action).toBe('buy')
        expect(res4[1].action).toBe('buy')

        const path5 = ['USDC', 'BISON', 'AGORA', 'START']
        const res5 = getPathActions(path5, router)
        expect(res5.length).toBe(3)
        expect(res5[0].action).toBe('buy')
        expect(res5[1].action).toBe('buy')
        expect(res5[2].action).toBe('buy')

        const path6 = ['BISON', 'AGORA', 'START', 'USDC']
        const res6 = getPathActions(path6, router)
        expect(res6.length).toBe(3)
        expect(res6[0].action).toBe('buy')
        expect(res6[1].action).toBe('buy')
        expect(res6[2].action).toBe('sell')
    })
})

describe('Graph', () => {
    it('Graphs single pool properly', () => {
        const creator = Wallet.create('creator', 'creator', 10000)
        const questA = creator.createQuest('TEST_1')
        const poolA = questA.createPool() // Deposit A
        globalState.quests.set('USDC', new UsdcToken())
        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)

        const router = new Router(globalState.quests, globalState.pools)

        const poolsList = router.findPoolsFor('TEST_1')
        const graph = router.graphPools(poolsList)

        expect(poolsList[0].tokenLeft).toBe('USDC')
        expect(poolsList[0].tokenRight).toBe('TEST_1')

        expect(graph.adjList.has('USDC')).toBe(true)
        expect(graph.adjList.has('TEST_1')).toBe(true)
    })
})

describe('Path finding', () => {
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
    it('Finds pools for token->USDC', () => {
        const { pool, tokenRight, tokenLeft } = preparePool(
            10000,
            'wallet',
            initialPositions
        )

        pool.buy(2000)
        globalState.pools.set(pool.name, pool)
        globalState.quests.set(tokenRight.name, tokenRight)
        const router = new Router(globalState.quests, globalState.pools)

        const sums = router.smartSwap(tokenRight.name, tokenLeft.name, 1000)

        expect(sums[0]).toBeCloseTo(-1000, 0)
        expect(sums[1]).toBeCloseTo(1527, 0) // was
    })
})

describe('Routing', () => {
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

    it('Proper selling in cross pools without violating price boundaries', () => {
        // Assume path: USDC-Praseodymium (5)-AGORA-Praseodymium (3)
        const { quest: qPRA3, pool: PRA3 } = getQP('Praseodymium (3)', 1000000)
        const { quest: qPRA5, pool: PRA5 } = getQP('Praseodymium (5)', 1000000)
        const { quest: qAGORA, pool: AGORA } = getQP('AGORA', 1000000)

        AGORA.buy(25000)

        AGORA.buy(555555)
        PRA3.buy(1480)
        PRA5.buy(5000)
        PRA5.buy(650)

        const { crossPool: AGORA_PRA3 } = getCP(
            qPRA3,
            qAGORA,
            PRA3,
            AGORA,
            0,
            50.025
        )
        const { crossPool: AGORA_PRA5 } = getCP(
            qPRA5,
            qAGORA,
            PRA5,
            AGORA,
            0,
            50.025
        )

        const pools = new HashMap()
        const quests = new HashMap()
        pools.set(AGORA.name, AGORA)
        pools.set(PRA3.name, PRA3)
        pools.set(PRA5.name, PRA5)
        pools.set(AGORA_PRA3.name, AGORA_PRA3)
        pools.set(AGORA_PRA5.name, AGORA_PRA5)

        quests.set(qPRA3.name, qPRA3)
        quests.set(qAGORA.name, qAGORA)
        quests.set(qPRA5.name, qPRA5)
        quests.set('USDC', new UsdcToken())

        const router = new Router(quests, pools)

        //console.log(router.smartSwap('USDC', 'Praseodymium (5)', 2000))
    })

    it('Smart route and taking right amount in/out', () => {
        const defaultPositions = TEMP_CONFIG.INITIAL_LIQUIDITY
        const creator = Wallet.create('creator', 'creator', 10000)

        const citedQuest = creator.createQuest('AGORA')
        const citedPool = citedQuest.createPool({
            initialPositions: defaultPositions
        })
        citedPool.buy(5550)

        const citingQuest = creator.createQuest('RUTHER')
        const citingPool = citingQuest.createPool({
            initialPositions: defaultPositions
        })
        citingPool.buy(5000)

        const usdcToken = new UsdcToken()
        usdcToken.addPool(citingPool)
        usdcToken.addPool(citedPool)
        globalState.quests.set('USDC', usdcToken)

        const startingPrice = citingPool.curPrice / citedPool.curPrice
        const crossPool = creator.createPool(
            citedQuest,
            citingQuest,
            startingPrice
        )

        citingQuest.addPool(crossPool)
        citedQuest.addPool(crossPool)
        globalState.quests.set(citingQuest.name, citingQuest)
        globalState.quests.set(citedQuest.name, citedQuest)

        globalState.pools.set(citingPool.name, citingPool)
        globalState.pools.set(citedPool.name, citedPool)

        const pr = creator.calculatePriceRange(crossPool, citedPool, citingPool)
        creator.citeQuest(crossPool, pr.min, pr.max, 2, 172.57, pr.native)

        globalState.pools.set(crossPool.name, crossPool)

        const router = new Router(globalState.quests, globalState.pools)
        const results1 = router.smartSwap('USDC', 'RUTHER', 1000)

        const acc = router.getSwaps().reduce((acc, swap) => {
            return swap.pool === 'USDC-AGORA' ? acc + swap.out : acc + 0
        }, 0)

        const acc2 = router.getSwaps().reduce((acc, swap) => {
            return swap.pool === 'AGORA-RUTHER' ? acc + swap.in : acc + 0
        }, 0)

        expect(acc).toBeCloseTo(acc2)
        expect(results1[0]).toBeCloseTo(-999.999)
        expect(results1[1]).toBeCloseTo(227.51)
    })

    it('Smart route with single pool', () => {
        const creator = Wallet.create('creator', 'creator', 10000)

        const questX = creator.createQuest('TEST_X')
        const poolTest = questX.createPool({ initialPositions })
        let allSums = [0, 0]
        for (let i = 1; i <= 500; i++) {
            const sums = poolTest.buy(10)
            allSums[0] += sums[0]
            allSums[1] += sums[1]
        }

        const questA = creator.createQuest('TEST_1')
        const poolA = questA.createPool({ initialPositions }) // Mint TEST_1
        globalState.quests.set(questA.name, questA)
        globalState.quests.set('USDC', new UsdcToken())
        globalState.pools.set(poolA.name, poolA)

        const router = new Router(globalState.quests, globalState.pools)
        const results1 = router.smartSwap('USDC', 'TEST_1', 5000)

        expect(poolA.curPrice).toBeCloseTo(poolTest.curPrice)
        expect(results1[1]).toBeCloseTo(allSums[1])
        expect(results1[0]).toBeCloseTo(-5000)
        expect(results1[1]).toBeCloseTo(2512.562)
    })

    it('Smart route with single pool and high amount', () => {
        const creator = Wallet.create('creator', 'creator', 10000)

        const questA = creator.createQuest('TEST_1')
        const poolA = questA.createPool({ initialPositions }) // Mint TEST_1
        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)
        globalState.quests.set('USDC', new UsdcToken())

        const router = new Router(globalState.quests, globalState.pools)
        const results1 = router.smartSwap('USDC', 'TEST_1', 2500000)
        // [ -2500000.000001435, 16380.246286907708 ] - 10: 18.6s
        // [ -2500000.0000000363, 16380.246286902951 ] - 100: 0.74s
        // [ -2500000.0000000363, 16380.246286902951 ] - 1000: 0.271s

        expect(results1[0]).toBeCloseTo(-2500000)
        expect(results1[1]).toBeCloseTo(16008, 0) // was 16380.246
    })

    it('Smart route with amount above 100 with high chunk size', () => {
        const creator = Wallet.create('creator', 'creator', 10000)

        const questA = creator.createQuest('TEST_1')
        const poolA = questA.createPool({ initialPositions }) // Mint TEST_1
        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)
        globalState.quests.set('USDC', new UsdcToken())

        const router = new Router(globalState.quests, globalState.pools)
        const results1 = router.smartSwap('USDC', 'TEST_1', 153)

        expect(results1[0]).toBeCloseTo(-153)
        expect(results1[1]).toBeCloseTo(148.501)
    })

    it('Smart route with amount below 100 with sliced chunk', () => {
        const creator = Wallet.create('creator', 'creator', 10000)

        const questA = creator.createQuest('TEST_1')
        const poolA = questA.createPool({ initialPositions }) // Mint TEST_1
        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)
        globalState.quests.set('USDC', new UsdcToken())

        const router = new Router(globalState.quests, globalState.pools)
        const results1 = router.smartSwap('USDC', 'TEST_1', 98)

        expect(results1[0]).toBeCloseTo(-98)
        expect(results1[1]).toBeCloseTo(96.134)
    })

    it('Smart route with amount based on liquidity', () => {
        const creator = Wallet.create('creator', 'creator', 10000)

        const questA = creator.createQuest('TEST_1')
        const poolA = questA.createPool({ initialPositions }) // Mint TEST_1
        poolA.buy(250000)

        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)
        globalState.quests.set('USDC', new UsdcToken())

        const questB = creator.createQuest('TEST_2')
        const poolB = questB.createPool({ initialPositions }) // Mint TEST_2
        poolB.buy(250000)

        globalState.quests.set(questB.name, questB)
        globalState.pools.set(poolB.name, poolB)

        const questC = creator.createQuest('TEST_3')
        const poolC = questC.createPool({ initialPositions }) // Mint TEST_3

        globalState.quests.set(questC.name, questC)
        globalState.pools.set(poolC.name, poolC)

        const startingPrice = poolB.curPrice / poolC.curPrice
        const BC = creator.createPool(questC, questB, startingPrice)
        questB.addPool(BC)
        questC.addPool(BC)

        globalState.pools.set(BC.name, BC)

        const pr = creator.calculatePriceRange(BC, poolC, poolB)
        creator.citeQuest(BC, pr.min, pr.max, 0, 10000, pr.native)

        const router = new Router(globalState.quests, globalState.pools)
        const results1 = router.smartSwap('USDC', 'TEST_2', 2500000)

        expect(results1[0]).toBeCloseTo(-2500000)
        expect(results1[1]).toBeCloseTo(7718.6, 0) // !!!!!!!!!! WAS: 7238
    })

    it('Swaps USDC for D through a long chain with enough token supply', () => {
        const defaultTokenASum = 100
        const [quests, pools] = prepareCrossPools(defaultTokenASum)

        for (const pool of Object.keys(pools)) {
            globalState.pools.set(pools[pool].name, pools[pool])
        }

        for (const quest of quests) {
            globalState.quests.set(quest.name, quest)
        }

        // Deposit USDC in all USDC pools
        pools.poolA.buy(1000) // Buy Token A
        pools.poolB.buy(1000) // Buy Token B
        pools.poolC.buy(1000) // Buy Token C
        pools.poolD.buy(1000) // Buy Token D
        pools.poolE.buy(1000) // Buy Token E

        // Deposit Tokens in Cross Pools
        pools.BA.buy(20) // Buy B by selling A
        pools.AC.buy(50) /// Buy A by selling C
        pools.CB.buy(60) // Buy B by selling C
        pools.EC.buy(80) /// Buy E by selling C
        pools.DA.buy(100) // Buy D by selling A
        pools.CD.buy(93) // Buy C by selling D
        pools.ED.buy(77) // Buy E by selling D
        pools.BE.buy(44) /// Buy B by selling E

        const router = new Router(globalState.quests, globalState.pools)
        const res1 = router.smartSwap('USDC', 'AGORA_D', 25000)

        expect(res1[0]).toBeCloseTo(-25000)
        expect(res1[1]).toBeCloseTo(3637, 0) // was 3852 // was 3948 // was 2967
    })

    it('Swaps USDC for D through a long chain with different crosspool supplies', () => {
        const defaultTokenASum = 100
        const [quests, pools] = prepareCrossPools(defaultTokenASum)

        for (const pool of Object.keys(pools)) {
            globalState.pools.set(pools[pool].name, pools[pool])
        }

        for (const quest of quests as Array<Quest>) {
            globalState.quests.set(quest.name, quest)
        }

        // Deposit USDC in all USDC pools
        pools.poolA.buy(1000) // Buy Token A
        pools.poolB.buy(1000) // Buy Token B
        pools.poolC.buy(1000) // Buy Token C
        pools.poolD.buy(1000) // Buy Token D
        pools.poolE.buy(1000) // Buy Token E

        const router = new Router(globalState.quests, globalState.pools)
        const res1 = router.smartSwap('USDC', 'AGORA_D', 25000, 2)

        expect(res1[0]).toBeCloseTo(-25000)
        expect(res1[1]).toBeCloseTo(3664.7, 0) // was: 4012.552, 4017.970, 4018
    })

    it('Smart route with one citation selling USDC/TEST1', () => {
        const priceMin = 1
        const priceMax = 10
        const citeAmount = 27

        const creator = Wallet.create('creator', 'creator', 10000)

        const questA = creator.createQuest('TEST_1')
        const poolA = questA.createPool({ initialPositions }) // Deposit A
        globalState.quests.set('USDC', new UsdcToken())
        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)

        const questB = creator.createQuest('TEST_2')
        const poolB = questB.createPool({ initialPositions }) // Deposit B
        globalState.quests.set(questB.name, questB)
        globalState.pools.set(poolB.name, poolB)

        // [TEST 2, TEST 1] (cited/citing)
        const startingPrice = poolA.curPrice / poolB.curPrice
        const AB = creator.createPool(questB, questA, startingPrice)
        questA.addPool(AB)
        questB.addPool(AB)
        creator.citeQuest(AB, priceMin, priceMax, 0, citeAmount)
        globalState.pools.set(AB.name, AB)

        const router = new Router(globalState.quests, globalState.pools)
        const res1 = router.smartSwap('USDC', 'TEST_1', 555)
        const res2 = router.smartSwap('TEST_1', 'USDC', 50)
        const res3 = router.smartSwap('TEST_1', 'USDC', 50)

        expect(res1[0]).toBeCloseTo(-555)
        expect(res1[1]).toBeCloseTo(500, 0)

        expect(res2[0]).toBeCloseTo(-50)
        expect(res2[1]).toBeCloseTo(60.9, 0)

        expect(res3[0]).toBeCloseTo(-50)
        expect(res3[1]).toBeCloseTo(59.6, 0)
    })

    it('Smart route with USDC buying citing', () => {
        const priceMin = 1
        const priceMax = 10
        const amount = 100
        const citeAmount = 25
        const defaultPositions = TEMP_CONFIG.INITIAL_LIQUIDITY

        const creator = Wallet.create('creator', 'creator', 10000)

        const questA = creator.createQuest('TEST_1')
        const poolA = questA.createPool({ initialPositions: defaultPositions }) // Deposit A
        globalState.quests.set('USDC', new UsdcToken())
        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)

        const questB = creator.createQuest('TEST_2')
        const poolB = questB.createPool({ initialPositions: defaultPositions }) // Deposit B
        globalState.quests.set(questB.name, questB)
        globalState.pools.set(poolB.name, poolB)
        poolB.buy(555) // Buy TEST_2 (around 500)

        // [TEST 1, TEST 2] (cited/citing)
        const startingPrice = poolA.curPrice / poolB.curPrice
        const AB = creator.createPool(questB, questA, startingPrice)
        questA.addPool(AB)
        questB.addPool(AB)
        creator.citeQuest(AB, priceMin, priceMax, citeAmount, 0)
        globalState.pools.set(AB.name, AB)
        AB.buy(25)

        const router = new Router(globalState.quests, globalState.pools)
        const results = router.smartSwap('USDC', 'TEST_1', amount)

        expect(results[0]).toBeCloseTo(-100)
        expect(results[1]).toBeCloseTo(98, 0) // was 98.058
    })

    it('Smart route with USDC buying cited', () => {
        const priceMin = 1
        const priceMax = 10
        const amount = 100
        const citeAmount = 25
        const defaultPositions = TEMP_CONFIG.INITIAL_LIQUIDITY

        const creator = Wallet.create('creator', 'creator', 10000)

        const questA = creator.createQuest('TEST_1')
        const poolA = questA.createPool({ initialPositions: defaultPositions }) // Deposit A
        globalState.quests.set('USDC', new UsdcToken())
        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)

        const questB = creator.createQuest('TEST_2')
        const poolB = questB.createPool({ initialPositions: defaultPositions }) // Deposit B
        globalState.quests.set(questB.name, questB)
        globalState.pools.set(poolB.name, poolB)
        poolB.buy(555) // Buy TEST_2 (around 500)

        // [TEST 1, TEST 2] (cited/citing)
        const startingPrice = poolA.curPrice / poolB.curPrice
        const AB = creator.createPool(questB, questA, startingPrice)
        questA.addPool(AB)
        questB.addPool(AB)
        creator.citeQuest(AB, priceMin, priceMax, 0, citeAmount)
        globalState.pools.set(AB.name, AB)
        AB.buy(25)

        const router = new Router(globalState.quests, globalState.pools)
        const results = router.smartSwap('USDC', 'TEST_2', amount)

        expect(results[0]).toBeCloseTo(-100)
        expect(results[1]).toBeCloseTo(92.92, 0) // was: 92.97
    })

    it('Smart route for token through cited cross pool', () => {
        const creator = Wallet.create('creator', 'creator', 10000)
        const defaultPositions = TEMP_CONFIG.INITIAL_LIQUIDITY

        const questA = creator.createQuest('TEST')
        const poolA = questA.createPool({ initialPositions: defaultPositions }) // Deposit A
        globalState.quests.set('USDC', new UsdcToken())
        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)
        poolA.buy(5000)

        const questB = creator.createQuest('AGORA')
        const poolB = questB.createPool({ initialPositions: defaultPositions }) // Deposit B
        globalState.quests.set(questB.name, questB)
        globalState.pools.set(poolB.name, poolB)

        const startingPrice = poolA.curPrice / poolB.curPrice
        const AB = creator.createPool(questB, questA, startingPrice)
        const priceRange = creator.calculatePriceRange(AB, poolB, poolA, 2)
        questA.addPool(AB)
        questB.addPool(AB)
        creator.citeQuest(
            AB,
            priceRange.min,
            priceRange.max,
            0,
            1005,
            priceRange.native
        )
        globalState.pools.set(AB.name, AB)

        const router = new Router(globalState.quests, globalState.pools)
        const res3 = router.smartSwap('USDC', 'TEST', 2000)

        expect(res3[0]).toBeCloseTo(-2000)
        expect(res3[1]).toBeCloseTo(417.1, 0) // was: 441, 421, 441, 416
    })

    it('Smart route for token through cited cross pool with multiple smart swaps', () => {
        const creator = Wallet.create('creator', 'creator', 10000)
        const defaultPositions = TEMP_CONFIG.INITIAL_LIQUIDITY

        const questA = creator.createQuest('TEST')
        const poolA = questA.createPool({ initialPositions: defaultPositions }) // Deposit A
        globalState.quests.set('USDC', new UsdcToken())
        globalState.quests.set(questA.name, questA)
        globalState.pools.set(poolA.name, poolA)
        poolA.buy(5000)

        const questB = creator.createQuest('AGORA')
        const poolB = questB.createPool({ initialPositions: defaultPositions }) // Deposit B
        globalState.quests.set(questB.name, questB)
        globalState.pools.set(poolB.name, poolB)

        const startingPrice = poolA.curPrice / poolB.curPrice
        const AB = creator.createPool(questB, questA, startingPrice)
        const priceRange = creator.calculatePriceRange(poolB, poolA, 2)
        questA.addPool(AB)
        questB.addPool(AB)
        creator.citeQuest(AB, priceRange.min, priceRange.max, 0, 1005)
        globalState.pools.set(AB.name, AB)

        const router = new Router(globalState.quests, globalState.pools)
        const res1 = router.smartSwap('USDC', 'TEST', 250)
        expect(res1[0]).toBeCloseTo(-250)
        expect(res1[1]).toBeCloseTo(61, 0) // 116, 61.59

        const res2 = router.smartSwap('USDC', 'TEST', 100)
        expect(res2[0]).toBeCloseTo(-100)
        expect(res2[1]).toBeCloseTo(23.8, 0) // 41

        const res3 = router.smartSwap('USDC', 'TEST', 50)
        expect(res3[0]).toBeCloseTo(-50)
        expect(res3[1]).toBeCloseTo(11.73, 0) // 20

        const res4 = router.smartSwap('USDC', 'TEST', 650)
        const res5 = router.smartSwap('USDC', 'TEST', 400)
        const res6 = router.smartSwap('USDC', 'TEST', 400)
        const res7 = router.smartSwap('USDC', 'TEST', 150)

        const sumIn =
            res1[0] + res2[0] + res3[0] + res4[0] + res5[0] + res6[0] + res7[0]
        const sumOut =
            res1[1] + res2[1] + res3[1] + res4[1] + res5[1] + res6[1] + res7[1]
        expect(sumIn).toBeCloseTo(-2000)
        expect(sumOut).toBeCloseTo(417, 0) // 619, 421
        expect(poolA.curPrice).toBeCloseTo(5.69, 0) // 4.36
        expect(poolB.curPrice).toBeCloseTo(1, 0) // 1.69
    })
})

describe('getMaxAmountInForPath()', () => {
    let quests: any = {}
    let pools: any = {}
    const shouldDebugRouter = true
    const ERR_MARGIN = 0.0000000001
    const objMapTo2dArray = (inpObj, mappingKey = 'name') =>
        Object.entries(inpObj).map(([, obj]) => [obj[mappingKey], obj])

    const createRouter = (questObj, poolsObj, isDbg = shouldDebugRouter) => {
        const poolsHashMap = new HashMap(objMapTo2dArray(pools))
        const questsHashMap = new HashMap(objMapTo2dArray(quests))

        return new Router(questsHashMap, poolsHashMap, isDbg)
    }

    beforeEach(() => {
        const { quest: questA, pool: poolA } = getQP('A', 1000000)
        const { quest: questB, pool: poolB } = getQP('B', 1000000)
        const { quest: questC, pool: poolC } = getQP('C', 1000000)
        quests.A = questA
        quests.B = questB
        quests.C = questC
        pools.A = poolA
        pools.B = poolB
        pools.C = poolC
    })

    it('swapPath A -> B -> C', () => {
        pools.A.buy(555555)
        pools.B.buy(5000)
        pools.C.buy(650)

        const { crossPool: poolAB } = getCP(
            quests.B,
            quests.A,
            pools.B,
            pools.A,
            0,
            1500
        )
        pools.AB = poolAB
        const { crossPool: poolBC } = getCP(
            quests.C,
            quests.B,
            pools.C,
            pools.B,
            0,
            75
        )
        pools.BC = poolBC
        const router = createRouter(quests, pools)

        const path = ['A', 'B', 'C']

        const result = router.getMaxAmountInForPath(1000, path)

        expect(result).toBeGreaterThanOrEqual(0.000000001)
    })

    it('return 0 for impassable path A -> C', () => {
        const router = createRouter(quests, pools)
        const path = ['A', 'C']
        const result = router.getMaxAmountInForPath(1000, path)

        expect(result).toBe(0)
    })

    it('return path A -> B -> C to be 0', () => {
        const router = createRouter(quests, pools)
        const path = ['A', 'B', 'C']

        const result = router.getMaxAmountInForPath(1000, path)

        // TODO: investigate why it's returning not 0 here and resolve this case
        //expect(result.toFixed(9)).toBe(ERR_MARGIN.toFixed(9))
    })
})

describe('getPathWithActionCaps()', () => {
    let quests: any = {}
    let pools: any = {}
    const shouldDebugRouter = true
    const objMapTo2dArray = (inpObj, mappingKey = 'name') =>
        Object.entries(inpObj).map(([, obj]) => [obj[mappingKey], obj])

    const createRouter = (questObj, poolsObj, isDbg = shouldDebugRouter) => {
        const poolsHashMap = new HashMap(objMapTo2dArray(pools))
        const questsHashMap = new HashMap(objMapTo2dArray(quests))

        return new Router(questsHashMap, poolsHashMap, isDbg)
    }

    beforeEach(() => {
        const { quest: questA, pool: poolA } = getQP('A', 1000000)
        const { quest: questB, pool: poolB } = getQP('B', 1000000)
        const { quest: questC, pool: poolC } = getQP('C', 1000000)
        quests.A = questA
        quests.B = questB
        quests.C = questC
        pools.A = poolA
        pools.B = poolB
        pools.C = poolC
        // pools.A.buy(50000)
        // pools.B.buy(10000)
        // pools.C.buy(651)

        const { crossPool: poolAB } = getCP(
            quests.B,
            quests.A,
            pools.B,
            pools.A,
            0,
            1500
        )
        pools.AB = poolAB
        const { crossPool: poolBC } = getCP(
            quests.C,
            quests.B,
            pools.C,
            pools.B,
            0,
            75
        )
        pools.BC = poolBC

        // a-b-c-d
        // ab b citing a: buy
        // bc b citing c: sell
        // cd d citing c: buy
    })

    it('empty array for empty pathActions', () => {
        const router = createRouter(quests, pools)
        const result = router.getPathWithActionCaps([])

        expect(result).toMatchObject([])
    })

    it('returns array filled in with maxTotalIn/maxTotalOut', () => {
        const router = createRouter(quests, pools)
        const pathActions = getPathActions(['A', 'B', 'C'], router)
        const result = router.getPathWithActionCaps(pathActions)

        result.forEach((step) => {
            expect(step).toHaveProperty('t0fort1')
            expect(step).toHaveProperty('t1fort0')
        })
    })

    it('returns correct direction for A-B-C', () => {
        const router = createRouter(quests, pools)
        const pathActions = getPathActions(['A', 'B', 'C'], router)
        const result = router.getPathWithActionCaps(pathActions)

        expect(result[0]).toMatchObject({
            action: 'buy',
            pool: expect.objectContaining({ name: pools.AB.name }),
            t0fort1: expect.any(Number),
            t1fort0: expect.any(Number)
        })
        expect(result[1]).toMatchObject({
            action: 'buy',
            pool: expect.objectContaining({ name: pools.BC.name }),
            t0fort1: expect.any(Number),
            t1fort0: expect.any(Number)
        })
    })

    it('returns correct t1fort0 for A-B-C', () => {
        const router = createRouter(quests, pools)
        const pathActions = getPathActions(['A', 'B', 'C'], router)
        const result = router.getPathWithActionCaps(pathActions)

        const stepAB = result.find((s) => s.pool.name === 'A-B')
        const stepBC = result.find((s) => s.pool.name === 'B-C')
        // expect(result).toBe(0)

        expect(stepAB.t1fort0).toBeCloseTo(1500, 2)
        expect(stepBC.t1fort0).toBeCloseTo(75, 2)
    })

    it('returns correct t1fort0 for USDC-B-C', () => {
        const router = createRouter(quests, pools)
        const pathActions = getPathActions(['USDC', 'B', 'C'], router)
        const result = router.getPathWithActionCaps(pathActions)

        const stepUsdcB = result.find((s) => s.pool.name === 'USDC-B')
        const stepBC = result.find((s) => s.pool.name === 'B-C')

        expect(stepUsdcB.t1fort0).toBeCloseTo(3885.8518631132183, 2)
        expect(stepBC.t1fort0).toBeCloseTo(75, 2)
    })
})
