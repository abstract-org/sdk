import { Hash } from 'crypto'
import HashMap from 'hashmap'

export const pp2p = (pricePoint) => {
    return 2 ** pricePoint
}

export const p2pp = (price) => {
    return Math.log2(price)
}

export const formSwapData = (
    pool,
    investor,
    action,
    totalAmountIn,
    totalAmountOut,
    paths,
    day,
    opName?: string
) => {
    return {
        pool: pool ? pool.name : '',
        price: pool ? pool.curPrice.toFixed(3) : 0,
        investorHash: investor.hash,
        action: action,
        mcap: pool.isQuest() ? pool.getMarketCap() : '',
        tvl: pool.isQuest() ? pool.getTVL() : '',
        totalAmountIn: totalAmountIn ? totalAmountIn.toFixed(3) : '',
        totalAmountOut: totalAmountOut ? totalAmountOut.toFixed(3) : '',
        paths: paths ? paths.join('-') : '',
        day: day,
        opName: opName || ''
    }
}

export const getCombinedSwaps = (smSwaps, pools) => {
    let combSwaps = {}
    smSwaps.forEach((smSwap) => {
        if (!combSwaps) {
            combSwaps = {}
        }
        if (!combSwaps[smSwap.pool]) {
            combSwaps[smSwap.pool] = {}
        }
        if (!combSwaps[smSwap.pool][smSwap.op]) {
            const pool = pools.get(smSwap.pool)
            combSwaps[smSwap.pool][smSwap.op] = {
                pool,
                totalAmountIn: 0,
                totalAmountOut: 0,
                action: smSwap.op,
                path: smSwap.path
            }
        }

        combSwaps[smSwap.pool][smSwap.op].totalAmountIn -= smSwap.in
        combSwaps[smSwap.pool][smSwap.op].totalAmountOut += smSwap.out
    })

    return combSwaps
}

export const byName = (name) => (item) => item.name === name

export const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const _resetObjProps =
    (propsToReset, resetValue = '') =>
    (obj) => {
        return Object.entries(obj).reduce(
            (resultObj, [k, v]) => ({
                ...resultObj,
                [k]: propsToReset.includes(k) ? resetValue : v
            }),
            {}
        )
    }

export const sanitizeRemoteScenario = (loadedObj) => ({
    ...loadedObj,
    scenario: {
        ...loadedObj.scenario,
        invConfigs: loadedObj.scenario.invConfigs.map(
            _resetObjProps(['excludeSingleName', 'includeSingleName'], '')
        ),
        questConfigs: loadedObj.scenario.questConfigs.map(
            _resetObjProps(['citeSingleName'], '')
        )
    }
})

export const isE10Zero = (amount) => {
    return Math.abs(amount) < 1e-10
}

export const isNearZero = (amount) => {
    return (
        0 ===
        parseInt(
            amount.toFixed(10).replace(/\D/g, '').split('').slice(0, 8).join('')
        )
    )
}

export const calcGrowthRate = (curr, prev) => {
    return ((curr - prev) / prev) * 100
}

export const priceDiff = (price1, price2) => {
    return ((price1 - price2) / price2) * 100
}

export const getPathActions = (path, router) => {
    let out = []

    for (const [id, quest] of path.entries()) {
        if (id === 0) continue

        const prev = path[id - 1] || null

        const curPool = router.getPoolByTokens(quest, prev)

        if (!curPool) {
            break
        }

        let action
        if (id === 1) {
            action = curPool.tokenLeft === prev ? 'buy' : 'sell'
        } else if (
            quest === curPool.tokenLeft ||
            (id === path.length - 1 && prev !== curPool.tokenLeft)
        ) {
            action = 'sell'
        } else {
            action = 'buy'
        }

        out.push({ pool: curPool, action })
    }

    return out
}

export const hashmapToObj = (hm) =>
    hm.entries().reduce((o, [k, v]) => ({ ...o, [k]: v }), {})

export const isZero = (num) => num === 0 || isE10Zero(num) || isNearZero(num)

/**
 * @description Creates hashmap of mappings from array of objects
 * @param {Object[]} arr
 * @param {string} linkingKey - field name for mapping key
 * @param {string} linkingValue - field name for mapping value
 * @returns {HashMap}
 */
export function createHashMappings<T>(
    arr: Array<T>,
    linkingKey: string,
    linkingValue: any
): HashMap<any, any> {
    const mappingsArray = arr.map((item) => [
        item[linkingKey],
        item[linkingValue]
    ])

    return new HashMap(mappingsArray)
}

export function convertArrayToHashMapByKey<T>(
    arr: Array<T>,
    key: string
): HashMap<unknown, unknown> {
    const resultHashMap = new HashMap()
    for (const item of arr) {
        if (item[key] != null) resultHashMap.set(item[key], item)
    }

    return resultHashMap
}

export const addStringToArrayUniq = (arr, str) => {
    const extendedArray = arr && Array.isArray(arr) ? [...arr, str] : [str]

    return Array.from(new Set(extendedArray))
}

export const convertNumToFloat8 = (value) => {
    switch (value) {
        case Infinity:
            return 'Infinity'
        case -Infinity:
            return '-Infinity'
        default:
            return value
    }
}
export const convertFloat8ToNum = (value) => {
    switch (value) {
        case 'Infinity':
            return Infinity
        case '-Infinity':
            return -Infinity
        default:
            return value
    }
}

export const inRangeFilter = (range) => (day) => {
    const from = parseInt(range.from)
    const to = parseInt(range.to)
    const isGreaterOrEqualFrom =
        !Number.isFinite(from) || Number.isNaN(from) || day >= from
    const isLessOrEqualTo =
        !Number.isFinite(to) || Number.isNaN(to) || day <= to
    return isGreaterOrEqualFrom && isLessOrEqualTo
}
