import { IPosition } from './IPosition'
import { Pool } from '../modules'

export interface IQuestCreate {
    hash: string
    kind: string
    content: string
    creator_hash: string
    initial_balance: number
}

export interface IQuest extends IQuestCreate {
    id: number
    created_at: Date
    published_at?: Date
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
    creatorHash?: string // Wallet that created the Quest
    pools: string[] // List of Pools in which current Quest exists
    initialBalance: number // Amount of balance/tokens minted during Quest creation
    createdAt: Date // Creation date
    publishedAt: Date // ublication date
}

export interface IQuestMethods {
    create(kind: string, content: string, creatorHash?: string): IQuest
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
