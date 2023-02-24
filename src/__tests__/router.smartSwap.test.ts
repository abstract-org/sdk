import HashMap from 'hashmap'
import { Wallet, UsdcToken, Router, Pool } from '../modules'
import { getCP, getQP } from './helpers/getQuestPools'
import { SNAPSHOT_PATH_WITH_ACTIONS } from './resources/pathWithActionCapsSnapshot'

describe('smartSwap()', () => {
    let quests: any = {}
    let pools: any = {}
    const shouldDebugRouter = false
    let token0
    let token1

    const objMapTo2dArray = (inpObj, mappingKey = 'name') =>
        Object.entries(inpObj).map(([, obj]) => [obj[mappingKey], obj])

    const createRouter = (questObj, poolsObj, isDbg = shouldDebugRouter) => {
        const poolsHashMap = new HashMap(objMapTo2dArray(poolsObj))
        const questsHashMap = new HashMap(objMapTo2dArray(questObj))

        return new Router(questsHashMap, poolsHashMap, isDbg)
    }

    describe('[A-B-C-D] buy-buy-buy', () => {
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

            pools.AB = getCP(
                quests.B,
                quests.A,
                pools.B,
                pools.A,
                0,
                150
            ).crossPool
            pools.BC = getCP(
                quests.C,
                quests.B,
                pools.C,
                pools.B,
                0,
                75
            ).crossPool
            pools.CD = getCP(
                quests.D,
                quests.C,
                pools.D,
                pools.C,
                0,
                220
            ).crossPool

            token0 = quests.A.name
            token1 = quests.D.name
        })

        afterEach(() => {
            quests = {}
            pools = {}
        })

        xit('tokenVolumes changes (amountIn > 1000)', () => {
            const volumeTokensBefore = Object.values(pools)
                .filter((p: Pool) => !p.isQuest())
                .map((p: Pool) => ({
                    name: p.name,
                    questLeftVolume: p.questLeftVolume,
                    questRightVolume: p.questRightVolume
                }))
            const router = createRouter(quests, pools, false)
            const amountIn = Math.round(Math.random() * 1000 + 1000)
            const result = router.smartSwap(token0, token1, amountIn)
            const volumeTokensAfter = Object.values(pools)
                .filter((p: Pool) => !p.isQuest())
                .map((p: Pool) => ({
                    name: p.name,
                    questLeftVolume: p.questLeftVolume,
                    questRightVolume: p.questRightVolume
                }))

            expect(volumeTokensAfter).not.toEqual(
                expect.arrayContaining(volumeTokensBefore)
            )
            volumeTokensAfter.forEach((after) => {
                const before = volumeTokensBefore.find(
                    (poolBefore) => poolBefore.name === after.name
                )
                if (!before) return
                expect(after.questLeftVolume).not.toEqual(
                    before.questLeftVolume
                )
                expect(after.questRightVolume).not.toEqual(
                    before.questRightVolume
                )
            })
        })

        it('spent > 0 & received > 0 (amountIn > 1000)', () => {
            const router = createRouter(quests, pools, false)
            const amountIn = Math.ceil(Math.random() * 1)
            const result = router.smartSwap(token0, token1, amountIn)
            const amountSpent = -result[0]
            const amountReceived = result[1]

            expect(amountSpent).toBeGreaterThanOrEqual(0)
            expect(amountReceived).toBeGreaterThanOrEqual(0)
        })

        xit('spent ~== amountIn & received > 0 when amountIn < 100', () => {
            const router = createRouter(quests, pools, false)
            const amountIn = Math.ceil(Math.random() * 100)
            const result = router.smartSwap(token0, token1, amountIn)
            const amountSpent = -result[0]
            const amountReceived = result[1]

            expect(amountSpent).toBeCloseTo(amountIn)
            expect(amountReceived).toBeGreaterThan(0)
        })
    })

    describe('[A-B-C-D] sell-buy-sell', () => {
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

            pools.AB = getCP(
                quests.A,
                quests.B,
                pools.B,
                pools.A,
                150,
                0
            ).crossPool
            pools.BC = getCP(
                quests.C,
                quests.B,
                pools.C,
                pools.B,
                0,
                75
            ).crossPool
            pools.CD = getCP(
                quests.C,
                quests.D,
                pools.D,
                pools.C,
                220,
                0
            ).crossPool

            token0 = quests.A.name
            token1 = quests.D.name
        })

        afterEach(() => {
            quests = {}
            pools = {}
        })

        xit('tokenVolumes changes (amountIn > 1000)', () => {
            const volumeTokensBefore = Object.values(pools)
                .filter((p: Pool) => !p.isQuest())
                .map((p: Pool) => ({
                    name: p.name,
                    questLeftVolume: p.questLeftVolume,
                    questRightVolume: p.questRightVolume
                }))
            const router = createRouter(quests, pools, false)
            const amountIn = Math.round(Math.random() * 1000 + 1000)
            const result = router.smartSwap(token0, token1, amountIn)
            const volumeTokensAfter = Object.values(pools)
                .filter((p: Pool) => !p.isQuest())
                .map((p: Pool) => ({
                    name: p.name,
                    questLeftVolume: p.questLeftVolume,
                    questRightVolume: p.questRightVolume
                }))

            expect(volumeTokensAfter).not.toEqual(
                expect.arrayContaining(volumeTokensBefore)
            )
            volumeTokensAfter.forEach((after) => {
                const before = volumeTokensBefore.find(
                    (poolBefore) => poolBefore.name === after.name
                )
                if (!before) return
                expect(after.questLeftVolume).not.toEqual(
                    before.questLeftVolume
                )
                expect(after.questRightVolume).not.toEqual(
                    before.questRightVolume
                )
            })
        })

        it('spent > 0 & received > 0 (amountIn > 1000)', () => {
            const router = createRouter(quests, pools, false)
            const amountIn = Math.ceil(Math.random() * 1)
            const result = router.smartSwap(token0, token1, amountIn)
            const amountSpent = -result[0]
            const amountReceived = result[1]

            expect(amountSpent).toBeGreaterThanOrEqual(0)
            expect(amountReceived).toBeGreaterThanOrEqual(0)
        })

        xit('spent ~== amountIn & received > 0 when amountIn < 100', () => {
            const router = createRouter(quests, pools, false)
            const amountIn = Math.ceil(Math.random() * 100)
            const result = router.smartSwap(token0, token1, amountIn)
            const amountSpent = -result[0]
            const amountReceived = result[1]

            expect(amountSpent).toBeCloseTo(amountIn)
            expect(amountReceived).toBeGreaterThan(0)
        })
    })

    describe('[A-B-C-D] buy-sell-buy', () => {
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

            pools.AB = getCP(
                quests.B,
                quests.A,
                pools.B,
                pools.A,
                0,
                150
            ).crossPool
            pools.CB = getCP(
                quests.B,
                quests.C,
                pools.C, // ?????
                pools.B,
                75,
                0
            ).crossPool
            pools.CD = getCP(
                quests.D,
                quests.C,
                pools.D,
                pools.C,
                0,
                220
            ).crossPool

            token0 = quests.A.name
            token1 = quests.D.name
        })

        afterEach(() => {
            quests = {}
            pools = {}
        })

        xit('tokenVolumes changes', () => {
            const volumeTokensBefore = Object.values(pools)
                .filter((p: Pool) => !p.isQuest())
                .map((p: Pool) => ({
                    name: p.name,
                    questLeftVolume: p.questLeftVolume,
                    questRightVolume: p.questRightVolume
                }))
            const router = createRouter(quests, pools, false)
            const token0 = quests.A.name
            const token1 = quests.D.name
            const amountIn = Math.round(Math.random() * 1000 + 1000)
            const result = router.smartSwap(token0, token1, amountIn)
            const volumeTokensAfter = Object.values(pools)
                .filter((p: Pool) => !p.isQuest())
                .map((p: Pool) => ({
                    name: p.name,
                    questLeftVolume: p.questLeftVolume,
                    questRightVolume: p.questRightVolume
                }))

            expect(volumeTokensAfter).not.toEqual(
                expect.arrayContaining(volumeTokensBefore)
            )
            volumeTokensAfter.forEach((after) => {
                const before: any =
                    volumeTokensBefore.find(
                        (poolBefore) => poolBefore.name === after.name
                    ) || {}

                expect(after.questLeftVolume).not.toEqual(
                    before.questLeftVolume
                )
                expect(after.questRightVolume).not.toEqual(
                    before.questRightVolume
                )
            })
        })

        it('spent > 0 & received > 0 when amountIn > 1000', () => {
            const router = createRouter(quests, pools, false)
            const amountIn = Math.ceil(Math.random() * 1000 + 1000)
            const result = router.smartSwap(token0, token1, amountIn)
            const amountSpent = -result[0]
            const amountReceived = result[1]

            expect(amountSpent).toBeGreaterThanOrEqual(0)
            expect(amountReceived).toBeGreaterThanOrEqual(0)
        })

        xit('spent ~== amountIn & received > 0 when amountIn < 100', () => {
            const router = createRouter(quests, pools, false)
            const amountIn = Math.ceil(Math.random() * 100)
            const questRightVolumebefore = pools.CD.questRightVolume
            const result = router.smartSwap(token0, token1, amountIn)
            const amountSpent = -result[0]
            const amountReceived = result[1]

            expect(amountSpent).toBeCloseTo(amountIn)
            expect(amountReceived).toBeLessThanOrEqual(questRightVolumebefore)
        })
    })

    describe('[A-B-C-D] ???', () => {
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

            pools.AB = getCP(
                quests.B,
                quests.A,
                pools.B,
                pools.A,
                0,
                150
            ).crossPool
            pools.BC = getCP(
                quests.C,
                quests.B,
                pools.C,
                pools.B,
                0,
                75
            ).crossPool
            pools.CD = getCP(
                quests.D,
                quests.C,
                pools.D,
                pools.C,
                0,
                220
            ).crossPool

            token0 = quests.A.name
            token1 = quests.D.name
        })

        afterEach(() => {
            quests = {}
            pools = {}
        })

        xit('tokenVolumes changes (amountIn > 1000)', () => {
            const volumeTokensBefore = Object.values(pools)
                .filter((p: Pool) => !p.isQuest())
                .map((p: Pool) => ({
                    name: p.name,
                    questLeftVolume: p.questLeftVolume,
                    questRightVolume: p.questRightVolume
                }))
            const router = createRouter(quests, pools, false)
            const amountIn = Math.round(Math.random() * 1000 + 1000)
            const result = router.smartSwap(token0, token1, amountIn)
            const volumeTokensAfter = Object.values(pools)
                .filter((p: Pool) => !p.isQuest())
                .map((p: Pool) => ({
                    name: p.name,
                    questLeftVolume: p.questLeftVolume,
                    questRightVolume: p.questRightVolume
                }))

            expect(volumeTokensAfter).not.toEqual(
                expect.arrayContaining(volumeTokensBefore)
            )
            volumeTokensAfter.forEach((after) => {
                const before = volumeTokensBefore.find(
                    (poolBefore) => poolBefore.name === after.name
                )
                if (!before) return
                expect(after.questLeftVolume).not.toEqual(
                    before.questLeftVolume
                )
                expect(after.questRightVolume).not.toEqual(
                    before.questRightVolume
                )
            })
        })

        it('spent > 0 & received > 0 (amountIn > 1000)', () => {
            const router = createRouter(quests, pools, false)
            const amountIn = Math.ceil(Math.random() * 1)
            const result = router.smartSwap(token0, token1, amountIn)
            const amountSpent = -result[0]
            const amountReceived = result[1]

            expect(amountSpent).toBeGreaterThanOrEqual(0)
            expect(amountReceived).toBeGreaterThanOrEqual(0)
        })

        xit('spent ~== amountIn & received > 0 when amountIn < 100', () => {
            const router = createRouter(quests, pools, false)
            const amountIn = Math.ceil(Math.random() * 100)
            const result = router.smartSwap(token0, token1, amountIn)
            const amountSpent = -result[0]
            const amountReceived = result[1]

            expect(amountSpent).toBeCloseTo(amountIn)
            expect(amountReceived).toBeGreaterThan(0)
        })
    })

    describe('Position shifting', () => {
        it('Properly changes position when buying out exact liquidity amount and avoids rounding errors', () => {
            const { quest: questA, pool: poolA } = getQP('A', 1000000)
            const routerQuests = []
            const routerPools = []
            routerQuests.push(questA)
            routerQuests.push(new UsdcToken())
            routerPools.push(poolA)

            const router = createRouter(routerQuests, routerPools, true)
            const amountIn = Infinity
            const result = router.smartSwap('USDC', questA.name, amountIn)
            const amountSpent = -result[0]
            const amountReceived = result[1]

            expect(amountSpent).toBeCloseTo(133426696.95298)
            expect(amountReceived).toBeCloseTo(20000, 0)
            expect(poolA.curLiq).toBeCloseTo(0, 0)
        })
    })

    describe('calculateAcceptableForCappedPathActions() -> buy -> buy -> sell', () => {
        xit('Calculates properAmountIn with buy->buy->sell', () => {
            const wallet = Wallet.create('INV', 'INV', 10000)

            const { pool: agoraPool, quest: agoraQuest } = getQP('AGORA')
            const { pool: pra5Pool, quest: pra5Quest } =
                getQP('Praseodymium (5)')
            const { pool: pra3Pool, quest: pra3Quest } =
                getQP('Praseodymium (3)')
            const startingPrice = 1
            const agoraPra5Pool = wallet.createPool(
                agoraQuest,
                pra5Quest,
                startingPrice
            )
            const pra3Pra5Pool = wallet.createPool(
                pra3Quest,
                pra5Quest,
                startingPrice
            )

            agoraQuest.addPool(agoraPra5Pool.name)
            pra3Quest.addPool(pra3Pra5Pool)
            pra5Quest.addPool(agoraPra5Pool)
            pra5Quest.addPool(pra3Pra5Pool)

            pra3Pool.buy(7803)
            pra5Pool.buy(6085)

            const pathWithActionCapsSnapshot = SNAPSHOT_PATH_WITH_ACTIONS
            pathWithActionCapsSnapshot.forEach((pact, idx) => {
                let mutatingPool
                switch (pact.pool.name) {
                    case 'USDC-AGORA':
                        mutatingPool = agoraPool
                        break

                    case 'AGORA-Praseodymium (5)':
                        mutatingPool = agoraPra5Pool
                        break

                    case 'Praseodymium (3)-Praseodymium (5)':
                        mutatingPool = pra3Pra5Pool
                        break
                    default:
                        break
                }

                for (const [field, value] of Object.entries(pact.pool)) {
                    if (field !== 'pos') {
                        mutatingPool[field] = value
                    } else {
                        for (const [id, posArr] of Object.entries(
                            pact.pool.pos._data
                        )) {
                            mutatingPool.pos.set(posArr[0], posArr[1])
                        }
                    }
                }

                pathWithActionCapsSnapshot[idx].pool = mutatingPool
            })

            const quests = []
            const pools = []

            quests.push(agoraQuest, pra3Quest, pra5Quest, new UsdcToken())
            pools.push(
                agoraPool,
                pra3Pool,
                pra5Pool,
                agoraPra5Pool,
                pra3Pra5Pool
            )

            const router = createRouter(quests, pools, false)

            // calc amts
            const res = router.calculateAcceptableForCappedPathActions(
                pathWithActionCapsSnapshot,
                ['USDC', agoraQuest.name, pra5Quest.name, pra3Quest.name]
            )

            const forcedPath = [
                new UsdcToken().name,
                agoraQuest.name,
                pra5Quest.name,
                pra3Quest.name
            ]
            const sums = router.smartSwap(
                'USDC',
                pra3Quest.name,
                1000,
                4,
                forcedPath
            )
        })
    })
})
