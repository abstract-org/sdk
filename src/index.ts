import SimAPI, { ConstructorSimConfig } from './api/sim/SimAPI'
import Web3API, { ConstructorWeb3Config } from './api/web3/Web3API'
import * as interfaces from './interfaces'

export class SimSdk {
    static init(
        adapter: string = 'sim',
        config: ConstructorSimConfig | ConstructorWeb3Config
    ): interfaces.IAPI {
        switch (adapter) {
            case 'sim':
                return new SimAPI(config as ConstructorSimConfig)
            case 'web3':
                return new Web3API(config as ConstructorWeb3Config)
            default:
                return new SimAPI(config as ConstructorSimConfig)
        }
    }
}

export type IAPI = interfaces.IAPI
export * as LogicUtils from './utils/logicUtils'
export * as MathUtils from './utils/mathUtils'
export * as Modules from './modules'
