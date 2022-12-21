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

export const updateStateInvestorConfig = (arr, newItem) =>
    arr.map((item) =>
        item.invGenAlias === newItem.invGenAlias ? newItem : item
    )

export const updateStateQuestConfig = (arr, newItem) =>
    arr.map((item) =>
        item.questGenAlias === newItem.questGenAlias ? newItem : item
    )

export const deleteStateInvestorConfig = (arr, invGenAlias) =>
    arr.filter((item) => item.invGenAlias !== invGenAlias)

export const deleteStateQuestConfig = (arr, questGenAlias) =>
    arr.filter((item) => item.questGenAlias !== questGenAlias)

export const toBase64 = (str) => window.btoa(encodeURIComponent(str))

export const fromBase64 = (b64) => decodeURIComponent(window.atob(b64))

export const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const overrideState = (stateObj, newData = {}, initialState = {}) => {
    let newState = initialState
    if (newData) {
        Object.entries(newData).forEach(([key, newValue]) => {
            if (stateObj.hasOwnProperty(key) && newData[key]) {
                newState[key] = newValue
            }
        })
    }

    return newState
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

export const getMissingQuestNames = (scenario) => {
    const quests = new Set()

    if (typeof scenario !== 'object') return

    scenario.invConfigs.forEach((conf) => {
        if (conf.excludeSingleName.length) {
            quests.add(conf.excludeSingleName)
        }

        if (conf.includeSingleName.length) {
            quests.add(conf.includeSingleName)
        }
    })

    scenario.questConfigs.forEach((conf) => {
        if (conf.citeSingleName.length) {
            quests.add(conf.citeSingleName)
        }
    })

    return Array.from(quests)
}

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

export const isNumericString = (str) => parseFloat(str) === Number(str)

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
export const createHashMappings = (arr, linkingKey, linkingValue) => {
    const mappingsArray = arr.map((item) => [
        item[linkingKey],
        item[linkingValue]
    ])

    return new HashMap(mappingsArray)
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