import { DefaultLiquidityPosition, IPositionLiquidity } from '../interfaces'
import { Pool, Quest } from '../modules'

export class WrapperService {
    static createPoolInstance(
        questLeftInstance: Quest,
        questRightInstance: Quest,
        type: string,
        kind: string,
        hash?: string,
        existingPositions?: IPositionLiquidity[],
        startingPrice?: number,
        initialPositions?: DefaultLiquidityPosition[]
    ): Pool {
        // Create a new Pool instance using the static create method.
        const poolConstructor = {
            tokenLeft: questLeftInstance,
            initialPositions: null,
            startingPrice: null
        }

        if (initialPositions) {
            poolConstructor.initialPositions = initialPositions
        }

        if (startingPrice) {
            poolConstructor.startingPrice = startingPrice
        }

        const pool = questRightInstance.createPool(poolConstructor)

        // Set additional properties on the pool instance.
        pool.type = type
        pool.kind = kind

        if (hash) {
            pool.hash = hash
        }

        if (existingPositions) {
            pool.hydratePositions(existingPositions)
        }

        return pool
    }

    static createQuestInstance(
        kind,
        content,
        creatorHash,
        forcedName?: string,
        hash?: string
    ): Quest {
        const questName = forcedName
            ? forcedName
            : `_${kind.toUpperCase()}${hash.substring(0, 4)}`
        // Create a new Quest instance using the static create method.
        const quest = Quest.create(questName, kind, content, creatorHash)

        // Set additional properties on the quest instance.
        if (hash) {
            quest.hash = hash
        }

        return quest
    }
}
