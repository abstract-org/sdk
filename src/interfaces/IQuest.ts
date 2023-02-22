import { IPosition } from './IPosition'
import { Pool } from '../modules'

export interface IQuestCreate {
    hash: string
    kind: string
    content: string
    creator_hash: string
}

export interface IQuest extends IQuestCreate {
    id: number
    name: string
    created_at: number
    published_at?: number
    pools: string[]
}

export interface IQuestUpdate
    extends Partial<Omit<IQuest, 'id' | 'created_at'>> {}

export interface IQuestBasicFields {
    content: string // Any textual content, it’s not limited to what it contains
    kind: string // Freeform kind that labels the content, for example: title, description, url, date, etc…
    hash: string // Hashed content+kind combination to create unique address to this content piece
}

export interface IQuestUtilityFields {
    creator_hash?: string // Wallet that created the Quest
    pools: string[] // List of Pools in which current Quest exists
    created_at: number // Creation date
    published_at: number // ublication date
}

export interface IQuestMethods {
    create(kind: string, content: string, creator_hash?: string): IQuest
    createPool(createArg: {
        questLeft?: IQuest
        startingPrice?: number
        initialPositions?: IPosition[]
    }): Pool
    addPool(pool: Pool): void
}

export interface IQuestEntity
    extends IQuestBasicFields,
        IQuestUtilityFields,
        IQuestMethods {}
