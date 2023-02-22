import { Wallet, UsdcToken } from '../../modules'
import { faker } from '@faker-js/faker'

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
    ]
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

export const preparePool = (
    initialSum = 35000,
    walletType = 'creator',
    initialPositions?: any
) => {
    if (!initialPositions) {
        initialPositions = TEMP_CONFIG.INITIAL_LIQUIDITY
    }

    const name = faker.word.adjective()
    const wallet = Wallet.create(walletType, name, initialSum)
    const tokenRight = wallet.createQuest('RP1')
    const tokenLeft = new UsdcToken()
    const pool = tokenRight.createPool({ tokenLeft, initialPositions })

    return { pool, wallet, tokenLeft, tokenRight }
}

export const prepareCrossPools = (citingSum): Array<any> => {
    const name = faker.word.adjective()
    const creator = Wallet.create('creator', name, 10000)
    const quests = []

    // USCD Pools
    const questA = creator.createQuest('AGORA_A')
    const poolA = questA.createPool({ initialPositions }) // Deposit A
    quests.push(questA)
    quests.push(new UsdcToken())

    const questB = creator.createQuest('AGORA_B')
    const poolB = questB.createPool({ initialPositions }) // Deposit B
    quests.push(questB)

    const questC = creator.createQuest('AGORA_C')
    const poolC = questC.createPool({ initialPositions }) // Deposit C
    quests.push(questC)

    const questD = creator.createQuest('AGORA_D')
    const poolD = questD.createPool({ initialPositions }) // Deposit D
    quests.push(questD)

    const questE = creator.createQuest('AGORA_E')
    const poolE = questE.createPool({ initialPositions }) // Deposit E
    quests.push(questE)

    // BA
    const startingPrice = poolA.curPrice / poolB.curPrice
    const BA = creator.createPool(questB, questA, startingPrice)
    const {
        min: pmin1,
        max: pmax1,
        native: native1
    } = creator.calculatePriceRange(BA, poolB, poolA)
    questA.addPool(BA)
    questB.addPool(BA)
    creator.citeQuest(BA, pmin1, pmax1, 0, citingSum, native1) // deposit A (citing)

    // AC
    const startingPrice2 = poolC.curPrice / poolA.curPrice
    const AC = creator.createPool(questA, questC, startingPrice2)
    const {
        min: pmin2,
        max: pmax2,
        native: native2
    } = creator.calculatePriceRange(AC, poolA, poolC)
    questA.addPool(AC)
    questC.addPool(AC)
    creator.citeQuest(AC, pmin2, pmax2, 0, citingSum, native2) // deposit C (citing)

    // CB
    const startingPrice3 = poolB.curPrice / poolC.curPrice
    const CB = creator.createPool(questC, questB, startingPrice3)
    const {
        min: pmin3,
        max: pmax3,
        native: native3
    } = creator.calculatePriceRange(CB, poolC, poolB)
    questB.addPool(CB)
    questC.addPool(CB)
    creator.citeQuest(CB, pmin3, pmax3, 0, citingSum, native3) // deposit B (citing)

    // EC
    const startingPrice4 = poolC.curPrice / poolE.curPrice
    const EC = creator.createPool(questE, questC, startingPrice4)
    const {
        min: pmin4,
        max: pmax4,
        native: native4
    } = creator.calculatePriceRange(EC, poolE, poolC)
    questC.addPool(EC)
    questE.addPool(EC)
    creator.citeQuest(EC, pmin4, pmax4, 0, citingSum, native4) // deposit C (citing)

    // DA
    const startingPrice5 = poolA.curPrice / poolD.curPrice
    const DA = creator.createPool(questD, questA, startingPrice5)
    const {
        min: pmin5,
        max: pmax5,
        native: native5
    } = creator.calculatePriceRange(DA, poolD, poolA)
    questA.addPool(DA)
    questD.addPool(DA)
    creator.citeQuest(DA, pmin5, pmax5, 0, citingSum, native5) // deposit A (citing)

    // ED
    const startingPrice6 = poolD.curPrice / poolE.curPrice
    const ED = creator.createPool(questE, questD, startingPrice6)
    const {
        min: pmin6,
        max: pmax6,
        native: native6
    } = creator.calculatePriceRange(ED, poolE, poolD)
    questD.addPool(ED)
    questE.addPool(ED)
    creator.citeQuest(ED, pmin6, pmax6, 0, citingSum, native6) // deposit D (citing)

    // CD
    const startingPrice7 = poolD.curPrice / poolC.curPrice
    const CD = creator.createPool(questC, questD, startingPrice7)
    const {
        min: pmin7,
        max: pmax7,
        native: native7
    } = creator.calculatePriceRange(CD, poolC, poolD)
    questC.addPool(CD)
    questD.addPool(CD)
    creator.citeQuest(CD, pmin7, pmax7, 0, citingSum, native7) // deposit D (citing)

    // BE
    const startingPrice8 = poolE.curPrice / poolB.curPrice
    const BE = creator.createPool(questB, questE, startingPrice8)
    const {
        min: pmin8,
        max: pmax8,
        native: native8
    } = creator.calculatePriceRange(BE, poolB, poolE)
    questB.addPool(BE)
    questE.addPool(BE)
    creator.citeQuest(BE, pmin8, pmax8, 0, citingSum, native8) // deposit E (citing)

    return [
        quests,
        {
            poolA,
            poolB,
            poolC,
            poolD,
            poolE,
            BA,
            AC,
            CB,
            EC,
            DA,
            ED,
            CD,
            BE
        }
    ]
}
