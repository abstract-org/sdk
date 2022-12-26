import SimAPI, { ConstructorSimConfig } from './api/sim/SimAPI'
import Web3API, { ConstructorWeb3Config } from './api/web3/Web3API'
import { IAPI } from './interfaces'

export class SimSdk {
    static init(
        adapter: string = 'sim',
        config: ConstructorSimConfig | ConstructorWeb3Config
    ): IAPI {
        switch (adapter) {
            case 'sim':
                return new SimAPI(config as ConstructorSimConfig)
            case 'web3':
                return new Web3API(config as ConstructorWeb3Config)
        }
    }
}

export * as LogicUtils from './utils/logicUtils'
export * as MathUtils from './utils/mathUtils'
export * as Modules from './modules'
