import { PoolType } from '../types'
import { IPosition } from './IPosition'
import { IPoolState } from './IPoolState'

export interface IPoolQueryUpdate {
    questLeftHash?: string
    questRightHash?: string
    type?: PoolType
    kind?: string
    hash?: string
}

export interface IPoolCreate {
    questLeftHash: string
    questRightHash: string
    type: PoolType
    kind: string
}

export interface IPool {
    id?: number
    questLeftHash: string
    questRightHash: string
    type: PoolType
    name: string
    kind: string
    hash: string
    positions: Array<IPosition>
    state: IPoolState
    hydratePositions(positions: object[]): void
    getPoolState(): IPoolState
}
