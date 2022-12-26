import { hashmapToObj, p2pp } from '../utils/logicUtils'
import { getQP } from './helpers/getQuestPools'
import { prepareCrossPools, preparePool } from './helpers/poolManager'

const TEMP_CONFIG = {
    INITIAL_LIQUIDITY: [
        {
            priceMin: 1,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        },
        {
            priceMin: 20,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        },
        {
            priceMin: 50,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        },
        {
            priceMin: 200,
            priceMax: 1000000,
            tokenA: 0,
            tokenB: 5000
        }
    ],
    JOURNAL: false,
    JOURNAL_BUY: false,
    JOURNAL_SELL: false
}

describe('Pool.class', () => {
    describe('Liquidity Manager', () => {
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

        it('calculates liquidity for token0', () => {
            const { pool } = preparePool()

            const liquidity = pool.getLiquidityForAmounts(
                0,
                5000,
                Math.sqrt(1),
                Math.sqrt(10000),
                1
            )
            expect(liquidity).toBeCloseTo(5050.505)
        })

        it('calculates liquidity for token1', () => {
            const { pool } = preparePool()

            const liquidity = pool.getLiquidityForAmounts(
                5000,
                0,
                Math.sqrt(0.0001),
                Math.sqrt(0.0002),
                1
            )
            expect(liquidity).toBeCloseTo(5050.505)
        })

        it('sets initial liquidity positions', () => {
            const { pool } = preparePool(10000, 'investor', initialPositions)
            expect(Math.round(pool.pos.get(p2pp(50)).liquidity)).toBeCloseTo(
                38046
            )
        })

        it('gets amount0 for liquidity', () => {
            const { pool } = preparePool()
            const firstPosition = TEMP_CONFIG.INITIAL_LIQUIDITY[0]

            const liquidity = pool.pos.get(p2pp(1)).liquidity

            const [amount0, _] = pool.getAmountsForLiquidity(
                liquidity,
                Math.sqrt(firstPosition.priceMin),
                Math.sqrt(firstPosition.priceMax),
                Math.sqrt(firstPosition.priceMin)
            )
            expect(amount0).toBe(firstPosition.tokenA)
        })

        it('gets amount1 for liquidity', () => {
            const { pool } = preparePool()
            const firstPosition = TEMP_CONFIG.INITIAL_LIQUIDITY[0]

            const liquidity = pool.pos.get(p2pp(1)).liquidity

            const [_, amount1] = pool.getAmountsForLiquidity(
                liquidity,
                Math.sqrt(firstPosition.priceMin),
                Math.sqrt(firstPosition.priceMax),
                Math.sqrt(firstPosition.priceMin)
            )
            expect(amount1).toBe(firstPosition.tokenB)
        })
    })

    describe('getUSDCValue()', () => {
        it('returns 0 for non-USDC crosspool', () => {
            const [, { BA, AC }] = prepareCrossPools(100)

            expect(BA.getUSDCValue()).toBe(0)
            expect(AC.getUSDCValue()).toBe(0)
        })

        it('returns correct value of USDC in pool', () => {
            const [, { poolA }] = prepareCrossPools(100)

            poolA.buy(1000)
            poolA.buy(2000)
            poolA.buy(3000)

            expect(poolA.getUSDCValue()).toBeCloseTo(6000, 5)
        })
    })

    describe('isQuest()', () => {
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
        it('returns true for QUEST pool', () => {
            const { pool } = preparePool(10000, 'investor', initialPositions)

            expect(pool.tokenLeft).toBe('USDC')
            expect(pool.isQuest()).toBe(true)
        })

        it('returns true for USDC pool', () => {
            const { pool } = preparePool()

            expect(pool.isQuest()).toBe(true)
        })

        it('returns false for cross-pools', () => {
            const [, { BA }] = prepareCrossPools(100)

            expect(BA.isQuest()).toBe(false)
        })
    })

    describe('buy()', () => {
        let tstPool = null

        beforeEach(() => {
            TEMP_CONFIG.JOURNAL = false
            TEMP_CONFIG.JOURNAL_BUY = false
            TEMP_CONFIG.JOURNAL_SELL = false
            tstPool = getQP('AGTST' + (Math.random() * 1000).toFixed()).pool
            // console.log('tstPool:', tstPool.name)
        })

        it('should reset FRESH', () => {
            tstPool.buy(1)

            expect(tstPool.FRESH).toEqual(false)
        })

        describe('when buy tokens for 0 USDC', () => {
            const amount = 0

            it('should return same as dryBuy', () => {
                const dryResult = tstPool.dryBuy(amount)
                const result = tstPool.buy(amount)

                expect(result).toEqual(dryResult)
            })

            it('should return expected amount', () => {
                const [totalAmountIn, totalAmountOut] = tstPool.buy(amount)
                const expectedIn = -0
                const expectedOut = 0

                expect(totalAmountIn).toBeCloseTo(expectedIn, 9)
                expect(totalAmountOut).toBeCloseTo(expectedOut, 9)
            })
        })

        describe('when buy tokens for 20000 USDC', () => {
            const amount = 20000

            it('should return same as dryBuy', () => {
                const dryResult = tstPool.dryBuy(amount)
                const result = tstPool.buy(amount)

                expect(result).toEqual(dryResult)
            })

            it('should return expected amount', () => {
                const [totalAmountIn, totalAmountOut] = tstPool.buy(amount)
                const expectedIn = -20000.0
                const expectedOut = 4042.035918964805

                expect(totalAmountIn).toBeCloseTo(expectedIn, 9)
                expect(totalAmountOut).toBeCloseTo(expectedOut, 9)
            })

            it('should not change positions map', () => {
                const initialPositions = hashmapToObj(tstPool.pos)
                tstPool.buy(amount)
                const newPositions = hashmapToObj(tstPool.pos)

                expect(newPositions).toEqual(initialPositions)
            })

            it('should shift current position', () => {
                const prevCurLiq = tstPool.curLiq
                const prevCurRight = tstPool.curRight
                const prevCurLeft = tstPool.curLeft
                const prevCurPP = tstPool.curPP
                tstPool.buy(amount)

                // console.log(
                //     `curLiq before: ${prevCurLiq} after: ${tstPool.curLiq} \n`,
                //     `curRight before: ${prevCurRight} after: ${tstPool.curRight} \n`,
                //     `curLeft before: ${prevCurLeft} after: ${tstPool.curLeft} \n`,
                //     `curPP before: ${prevCurPP}after: ${tstPool.curPP} \n`
                // )
                expect(tstPool.curLiq).toBeGreaterThan(prevCurLiq)
                expect(tstPool.curRight).toBeGreaterThan(prevCurRight)
                expect(tstPool.curLeft).toBeGreaterThan(prevCurLeft)
                expect(tstPool.curPP).toBeGreaterThan(prevCurPP)
            })

            it('should change prices', () => {
                const prevCurPrice = tstPool.curPrice
                const prevPriceToken1 = tstPool.priceToken1
                const prevPriceToken0 = tstPool.priceToken0

                tstPool.buy(amount)

                // console.log(
                //     `curPrice before: ${prevCurPrice} after: ${tstPool.curPrice} \n`,
                //     `priceToken1 before: ${prevPriceToken1} after: ${tstPool.priceToken1} \n`,
                //     `priceToken0 before: ${prevPriceToken0} after: ${tstPool.priceToken0} \n`
                // )
                expect(tstPool.curPrice).toBeGreaterThan(prevCurPrice)
                expect(tstPool.priceToken1).not.toBeCloseTo(prevPriceToken1, 9)
                expect(tstPool.priceToken0).not.toBeCloseTo(prevPriceToken0, 9)
            })

            it('should change totalSold and tokenVolumes', () => {
                const prevTotalSold = tstPool.totalSold
                const prevVolumeToken0 = tstPool.volumeToken0
                const prevVolumeToken1 = tstPool.volumeToken1
                const [totalAmountIn, totalAmountOut] = tstPool.buy(amount)

                expect(tstPool.totalSold).toBeGreaterThan(prevTotalSold)
                expect(tstPool.volumeToken0).toBeCloseTo(
                    prevVolumeToken0 + Math.abs(totalAmountIn),
                    9
                )
                expect(tstPool.volumeToken1).toBeCloseTo(
                    prevVolumeToken1 - Math.abs(totalAmountOut)
                )
            })
        })
    })
})
