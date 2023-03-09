import HashMap from 'hashmap'

import { getPathActions, isZero } from '../utils/logicUtils'
import { Graph } from './Graph'
import {
    buySameLiqGiveT0GetT1,
    buySameLiqGiveT1GetT0,
    getSwapAmtSameLiq,
    sellSameLiqGiveT0GetT1,
    sellSameLiqGiveT1GetT0
} from '../utils/mathUtils'
import { Pool } from './Pool'
import { Quest } from './Quest'

const ERR_MARGIN = 0.0000000001

export class Router {
    _cachedPools = new HashMap<string, Pool>()
    _cachedQuests = new HashMap<string, Quest>()
    _shouldScanPaths = true

    _PRICED_PATHS = []
    _SWAPS = []
    _PROTO_SWAPS = []
    _PAIR_PATHS = {}
    _DEFAULT_SWAP_SUM = 1
    _SWAP_SUM = 1

    /* eslint-disable no-loop-func */
    _DEBUG = false

    _visitedForGraph = []
    tempSwapReturns = 0

    /**
     *
     * @param {Array} stateQuests
     * @param {Array} statePools
     * @param {boolean} debug
     */
    constructor(stateQuests, statePools, debug = false) {
        this._cachedQuests = stateQuests
        this._cachedPools = statePools
        this._DEBUG = debug
    }

    /**
     * @param {string} token0
     * @param {string} token1
     * @param {number} amountIn
     * @param {number} smartRouteDepth
     * @param {number} forcedPath
     * @returns {*[]|number[]}
     */
    smartSwap(token0, token1, amountIn, smartRouteDepth = 1, forcedPath?: any) {
        if (this._DEBUG) {
            console.log(
                `\n--- SMART ROUTE ${token0}/${token1}/${amountIn}---\n`
            )
        }

        this._SWAPS = []
        this._visitedForGraph = []
        this._PAIR_PATHS[`${token0}-${token1}`] = this.calculatePairPaths(
            token0,
            token1,
            smartRouteDepth
        )
        this.setSwapSum(amountIn)

        const totalInOut = [0, 0]
        let properAmountIn
        let pathToSwap
        do {
            this._PRICED_PATHS = this.drySwapForPricedPaths(
                this.getPairPaths(token0, token1)
            )

            if (this._DEBUG)
                console.log(
                    'priced paths',
                    this._PRICED_PATHS,
                    `amountIn: ${amountIn}`
                )

            if (!this._PRICED_PATHS.length) return totalInOut

            // @TODO: Remove later, done for tests
            if (forcedPath) {
                pathToSwap = forcedPath
            }

            // @TODO: Should use chunks as sums (this.setSwapSum) and priceLimit until next best path to eliminate arbitrage

            // Could be a replacement for drySwap - get anything above zero for available paths and trade it, otherwise exit trade
            for (const pricedPath of this._PRICED_PATHS) {
                properAmountIn = this.getMaxAmountInForPath(
                    amountIn,
                    pricedPath.path
                )
                /* console.debug(
                    'seeking proper amt in',
                    properAmountIn,
                    pricedPath.path
                ) */

                if (!isZero(properAmountIn)) {
                    // console.log('properAmountIn() > 0 loop', properAmountIn)
                    pathToSwap = pricedPath.path
                    break
                }
            }

            if (isZero(properAmountIn)) {
                break
            }

            //console.log(`###DEBUG Calculated properAmountIn: ${properAmountIn}`)
            const sums = this.swapPricedPath(properAmountIn, pathToSwap)

            amountIn -= sums[0]
            totalInOut[0] -= sums[0]
            totalInOut[1] += sums[1]
            //console.log('while-loop iteration ', counterWhileLoop++, 'ended')
        } while (
            this._PRICED_PATHS.length &&
            !isZero(amountIn) &&
            !isZero(properAmountIn)
        )

        return totalInOut
    }

    setSwapSum(amountIn) {
        if (amountIn < this._DEFAULT_SWAP_SUM) {
            this._SWAP_SUM = amountIn
        } else {
            this._SWAP_SUM = this._DEFAULT_SWAP_SUM
        }
    }

    /**
     * @description Calculates max amount could be thrown into swaps chain to have tokens without surplus
     * @param {number} amountIn
     * @param {string[]} path
     * @returns {number} max acceptable amount in for the path
     */
    getMaxAmountInForPath(amountIn, path) {
        const pathActions = getPathActions(path, this)
        if (!pathActions || !pathActions.length) return 0

        const pathWithActionsCaps = this.getPathWithActionCaps(pathActions)
        if (!pathWithActionsCaps || !pathWithActionsCaps.length) return 0

        const maxAcceptable = this.calculateAcceptableForCappedPathActions(
            pathWithActionsCaps,
            path
        )

        return maxAcceptable > amountIn ? amountIn : maxAcceptable + ERR_MARGIN // @ostap forgive me....
    }

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
    getPathWithActionCaps(pathActions) {
        const pathActionsWithCaps = []

        for (const step of pathActions) {
            const zeroForOne = step.action === 'buy'

            const cappedAmountsSameLiq = getSwapAmtSameLiq(
                step.pool,
                zeroForOne
            )
            if (
                cappedAmountsSameLiq.t0fort1 === 0 ||
                cappedAmountsSameLiq.t1fort0 === 0
            ) {
                return null
            }
            pathActionsWithCaps.push({
                ...step,
                ...cappedAmountsSameLiq
            })
        }

        //console.log('pathActionsWithCaps()', pathActionsWithCaps)

        return pathActionsWithCaps
    }

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
    calculateAcceptableForCappedPathActions(pathWithActionCaps, path = []) {
        this._PROTO_SWAPS = []
        if (!Array.isArray(pathWithActionCaps) || !pathWithActionCaps.length) {
            return 0
        }

        const reversedPath = [...pathWithActionCaps].reverse()
        let carryOver = 0
        let newAmount = 0

        // @FIXME: I don't work as intended, probably should cap last iteration too before calculating real amount
        reversedPath.forEach((step, idx) => {
            const zeroForOne = step.action === 'buy'
            const activeCurLiq = step.pool.getNearestActiveLiq(zeroForOne)
            if (!Array.isArray(activeCurLiq) || activeCurLiq.length < 1) {
                console.log('Active liquidity NOT FOUND for step', step)
            }
            if (idx === 0) {
                step.pool.getNearestActiveLiq(zeroForOne)
                newAmount = zeroForOne
                    ? buySameLiqGiveT1GetT0(
                          activeCurLiq[0],
                          activeCurLiq[1],
                          step.t1fort0
                      )
                    : sellSameLiqGiveT0GetT1(
                          activeCurLiq[0],
                          activeCurLiq[1],
                          step.t0fort1
                      )
                carryOver = newAmount
                // ###DEBUG
                this._PROTO_SWAPS.push({
                    path,
                    pool: step.pool.name,
                    op: zeroForOne ? 'SHOULD buy' : 'SHOULD sell',
                    in: Math.abs(newAmount),
                    out: Math.abs(zeroForOne ? step.t1fort0 : step.t0fort1)
                })
                // ###DEBUG
                return
            }

            const prev = reversedPath[idx - 1]
            const prevZeroForOne = prev.action === 'buy'
            const activePrevLiq = prev.pool.getNearestActiveLiq(prevZeroForOne)

            if (idx === reversedPath.length - 1) {
                newAmount = zeroForOne
                    ? buySameLiqGiveT1GetT0(
                          activeCurLiq[0],
                          activeCurLiq[1],
                          carryOver
                      )
                    : sellSameLiqGiveT0GetT1(
                          activeCurLiq[0],
                          activeCurLiq[1],
                          carryOver
                      )

                // ###DEBUG
                this._PROTO_SWAPS.push({
                    path,
                    pool: step.pool.name,
                    op: zeroForOne ? 'SHOULD buy' : 'SHOULD sell',
                    in: Math.abs(newAmount),
                    out: Math.abs(carryOver)
                })
                // ###DEBUG
            } else {
                // previous step capped amountIn
                let prevT = prevZeroForOne
                    ? buySameLiqGiveT1GetT0(
                          activePrevLiq[0],
                          activePrevLiq[1],
                          prev.t1fort0
                      )
                    : sellSameLiqGiveT0GetT1(
                          activePrevLiq[0],
                          activePrevLiq[1],
                          prev.t0fort1
                      )

                // current step capped amountOut
                let curT = zeroForOne
                    ? buySameLiqGiveT0GetT1(
                          activeCurLiq[0],
                          activeCurLiq[1],
                          step.t0fort1
                      )
                    : sellSameLiqGiveT1GetT0(
                          activeCurLiq[0],
                          activeCurLiq[1],
                          step.t1fort0
                      )

                curT = Math.min(prevT, curT)

                // current step capped amountIn
                let newT = zeroForOne
                    ? buySameLiqGiveT1GetT0(
                          activeCurLiq[0],
                          activeCurLiq[1],
                          curT
                      )
                    : sellSameLiqGiveT0GetT1(
                          activeCurLiq[0],
                          activeCurLiq[1],
                          curT
                      )

                // ###DEBUG
                this._PROTO_SWAPS.push({
                    path,
                    pool: step.pool.name,
                    op: zeroForOne ? 'SHOULD buy' : 'SHOULD sell',
                    in: Math.abs(newT),
                    out: Math.abs(curT)
                    // out: Math.abs(carryOver)
                })
                // ###DEBUG
                carryOver = newT
            }
        })

        return newAmount
    }

    swapPricedPath(amountIn, path) {
        const swaps = this.swapPath(amountIn, path)
        //console.log(amountIn, 'swapPricedPath() swaps to be', swaps)
        const leftoverAmt = amountIn - swaps[0].in

        // Pool state preserved
        if (swaps.length === 1 && (swaps[0].in === 0 || swaps[0].out === 0)) {
            return [0, 0]
        }

        this._SWAPS = [...this._SWAPS, ...swaps]

        if (isZero(leftoverAmt)) {
            return [swaps[0].in, swaps[swaps.length - 1].out]
        }

        return [swaps[0].in, swaps[swaps.length - 1].out]
    }

    /**
     * @description Swap once within a given path with total amountIn
     * @param {number} amountIn
     * @param {string[]} path
     * @returns swaps array throughout the path
     */
    swapPath(amountIn, path) {
        const pathActions = getPathActions(path, this)
        const pathWithActionsCaps = this.getPathWithActionCaps(pathActions)

        let pathSwaps = []
        let amountSwap = amountIn

        for (const [id, pact] of pathActions.entries()) {
            const { action, pool } = pact
            const zeroForOne = action === 'buy'
            const poolSums = pool[action](amountSwap)

            // if wanted to buy 10A, but bought 9A
            // if wanted to sell 9A, but sold 8A
            // buy: t0 in, t1 out
            // sell: t1 in, t0 out
            // buy: t0 amountSwap, poolSums[0], desiredOutDry[0], t1 desiredOutDry[1], poolSums[1]
            // sell: t1 amountSwap, poolSums[0], desiredOutDry[0], t0 desiredOutDry[1], poolSums[1]
            // const desiredOutDry = pool.drySwap(amountSwap, zeroForOne)
            // const leftDesired = zeroForOne ? amountSwap : desiredOutDry[1]
            // const rightDesired = zeroForOne ? desiredOutDry[1] : amountSwap
            // const leftActual = zeroForOne ? poolSums[0] : poolSums[1]
            // const rightActual = zeroForOne ? poolSums[1] : poolSums[0]

            // watcherStore('swaps', pool.tokenLeft, leftDesired, leftActual)
            // watcherStore('swaps', pool.tokenRight, rightDesired, rightActual)

            pathSwaps.push({
                path: path,
                pool: pool.name,
                op: zeroForOne ? 'BOUGHT' : 'SOLD',
                in: Math.abs(poolSums[0]),
                out: Math.abs(poolSums[1])
            })

            if (poolSums[0] === 0 || poolSums[1] === 0) {
                console.log('Should never happen')
                break
            }

            amountSwap = poolSums[1]
        }

        pathSwaps.forEach((sw, idx) => {
            if (idx > 0) {
                const prev = pathSwaps[idx - 1]

                const curSum = sw.in
                const prevSum = prev.out

                if (parseFloat(curSum) !== parseFloat(prevSum)) {
                    const isLeak = !isZero(prevSum - curSum)

                    if (isLeak) {
                        console.error('### ALERT: ROUTER ###')
                        console.error(
                            `${path.join(
                                ' -> '
                            )} traversal\n got ${prevSum} but passed further ${curSum}\n leaking [${
                                prevSum - curSum
                            }]`
                        )
                        console.error(
                            '_PROTO_SWAPS:\n',
                            [...this._PROTO_SWAPS].reverse()
                        )
                        console.error('pathSwaps:\n', pathSwaps)
                        console.error(
                            'With calculated path amounts:\n',
                            pathWithActionsCaps
                        )
                        // Can be used to stop debugger on Eroor/Exception without expicit breakpoint
                        // try {
                        //     throw new Error('Leak Error!!!')
                        // } catch (err) {
                        //     console.error(err)
                        // }
                    }
                }
            }
        })

        return pathSwaps
    }

    /**
     * Takes array of string arrays (paths) and dry swaps each one of them to get their out/in price and sorts by best to worst price
     * @param {string[][]} paths
     * @returns Array of objects like {path: string[], price: number}
     */
    drySwapForPricedPaths(paths) {
        let pathPrices = []
        let existingPrices = []
        for (const path of paths) {
            const sumsTotal = this.drySwapPath(path)

            if (!sumsTotal) {
                continue
            }

            const sums = [sumsTotal[0][0], sumsTotal[sumsTotal.length - 1][1]]

            if (sums[0] === 0 || sums[1] === 0) {
                continue
            }

            const outPrice = this.getOutInPrice(sums[0], sums[1])

            pathPrices.push({
                path,
                price: outPrice
            })

            existingPrices.push(outPrice)
        }

        pathPrices.sort((a, b) => b.price - a.price)
        return pathPrices
    }

    /**
     * @description Takes array path and swaps through the entire path and returns prices along the way
     * @param {string[]} path
     * @param {number} [amount]
     * @returns {[number, number][]} array of pairs
     */
    drySwapPath(path, amount = 1) {
        let sumsTotal = []
        let nextAmountIn = amount

        const pathActions = getPathActions(path, this)

        for (const pact of pathActions) {
            const { action, pool } = pact
            const zeroForOne = action === 'buy'

            const hasNextToken = zeroForOne
                ? !isZero(pool.questRightVolume)
                : !isZero(pool.questLeftVolume)

            if (!hasNextToken) {
                return null
            }

            const sums = pool.drySwap(nextAmountIn, zeroForOne)

            if (Math.abs(sums[0]) === 0 && Math.abs(sums[1]) === 0) {
                return null
            }

            nextAmountIn = Math.abs(sums[1])
            sumsTotal.push(sums)
        }

        return sumsTotal
    }

    /**
     * @description For a requested token pair returns calculated pathways that should be then weighted for best price
     * @param {string} token0
     * @param {string} token1
     * @param {number} smartRouteDepth
     * @returns Array of possible paths
     */
    calculatePairPaths(token0, token1, smartRouteDepth) {
        const poolList = this.findPoolsFor(token0, smartRouteDepth)
        if (this._DEBUG) console.log('pool list', poolList)
        if (this._DEBUG && poolList.length <= 0) console.log(this._cachedQuests)
        const graph = this.graphPools(poolList, smartRouteDepth)
        if (this._DEBUG) console.log('graph', graph)
        const paths = graph.buildPathways(token0, token1)
        if (this._DEBUG) console.log('pair paths', paths)

        return paths
    }

    /**
     * @description Finds all pools for a specific token under restricted depth
     * @param {string} tokenName
     * @param {number} maxDepth
     * @param {number} depth
     * @returns {[]|*[]}
     */
    findPoolsFor(tokenName, maxDepth?: number, depth = 1) {
        let results = this._processTokenForPath(tokenName)

        if (depth >= maxDepth && this._shouldScanPaths) {
            this._shouldScanPaths = false
            return results
        }

        results.forEach((res) => {
            const leftPools = this.findPoolsFor(
                res.tokenLeft,
                maxDepth,
                depth + 1
            )
            const rightPools = this.findPoolsFor(
                res.tokenRight,
                maxDepth,
                depth + 1
            )

            results = Array.prototype.concat(results, leftPools, rightPools)
        })

        return results
    }

    /**
     * @description Creates cyclic undirected graph of all connected pools
     * @param {Pool[]} poolList
     * @param {number} smartRouteDepth
     * @returns Graph instance
     */
    graphPools(poolList, smartRouteDepth?: number) {
        const graph = new Graph(smartRouteDepth)
        poolList.forEach((pool) => {
            if (!graph.adjList.has(pool.tokenLeft)) {
                graph.addVertex(pool.tokenLeft)
            }

            if (!graph.adjList.has(pool.tokenRight)) {
                graph.addVertex(pool.tokenRight)
            }
        })

        poolList.forEach((pool) => {
            graph.addEdge(pool.tokenLeft, pool.tokenRight)
        })

        return graph
    }

    _processTokenForPath(tokenName) {
        let quest = this._cachedQuests.get(tokenName)

        if (!quest) {
            return []
        }

        let candidatePools = quest.pools

        if (!candidatePools || candidatePools.length <= 0) {
            return []
        }

        const result = []
        candidatePools.forEach((pool) => {
            const foundPool = this._cachedPools.get(pool)
            if (!foundPool || this._visitedForGraph.includes(foundPool.name)) {
                return
            }

            this._visitedForGraph.push(foundPool.name)

            result.push({
                for: tokenName,
                tokenLeft: foundPool.tokenLeft,
                tokenRight: foundPool.tokenRight
            })
        })

        return result
    }

    getPairPaths(token0, token1) {
        return this._PAIR_PATHS[`${token0}-${token1}`]
    }

    // 1:2 = 2
    // 1:1.5 = 1.5
    getOutInPrice(inAmt, outAmt) {
        return Math.abs(outAmt) / Math.abs(inAmt)
    }

    getSwaps() {
        return this._SWAPS
    }

    getPoolByTokens(tokenA, tokenB) {
        return this._cachedPools.has(`${tokenA}-${tokenB}`)
            ? this._cachedPools.get(`${tokenA}-${tokenB}`)
            : this._cachedPools.get(`${tokenB}-${tokenA}`)
    }
}
