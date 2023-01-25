import { PoolType } from '../types'
import { IPosition } from './IPosition'
import { IPoolState } from './IPoolState'

export interface IPoolQueryUpdate {
    questLeftHash?: string;
    questRightHash?: string;
    type?: PoolType;
    kind?: string;
    hash?: string;
}

export interface IPoolCreate {
    questLeftHash: string;
    questRightHash: string;
    type: PoolType;
    kind: string;
    hash: string;
}

export interface IPool {
    questLeftHash: string;
    questRightHash: string;
    type: PoolType;
    kind: string;
    hash: string;
    positions: Array<IPosition>
    state: IPoolState
}
