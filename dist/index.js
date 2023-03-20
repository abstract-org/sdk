import SimAPI from './api/sim/SimAPI';
import Web3API from './api/web3/Web3API';
export class SimSdk {
    static init(adapter = 'sim', config) {
        switch (adapter) {
            case 'sim':
                return new SimAPI(config);
            case 'web3':
                return new Web3API(config);
        }
    }
}
export * as LogicUtils from './utils/logicUtils';
export * as MathUtils from './utils/mathUtils';
export * as Modules from './modules';
export { positionsDefault } from './globals/positions.default';
//# sourceMappingURL=index.js.map