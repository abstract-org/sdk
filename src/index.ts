import 'reflect-metadata'
import mitt from 'mitt'
import { ISDKEvents } from './interfaces/ISDKEvents'
export class SDK {
    static events = mitt<ISDKEvents>()
}

export * as LogicUtils from './common/utils/logicUtils'
export * as MathUtils from './common/utils/mathUtils'
export * as Modules from './common/modules'
export * from './common/types'
export * from './common/interfaces'
export * from './interfaces'
