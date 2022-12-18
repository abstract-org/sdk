import SimAPI from './api/sim/SimAPI'
import Web3API from './api/web3/Web3API'
import {IAPI} from "./interfaces";

export interface ConstructorSimConfig {
    dbUrl: string;
    accessToken: string;
}

export interface ConstructorWeb3Config {
    rpcUrl: string
}

export class SimSdk {
    static init(adapter:string = 'sim', config: ConstructorSimConfig | ConstructorWeb3Config): IAPI {
        switch (adapter) {
            case 'sim':
                return new SimAPI(config as ConstructorSimConfig)
            case 'web3':
                return new Web3API(config as ConstructorWeb3Config)
        }
    }
}

export default SimSdk