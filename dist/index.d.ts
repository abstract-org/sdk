import { ConstructorSimConfig } from './api/sim/SimAPI';
import { ConstructorWeb3Config } from './api/web3/Web3API';
import { IAPI } from './interfaces';
export declare class SimSdk {
    static init(adapter: string, config: ConstructorSimConfig | ConstructorWeb3Config): IAPI;
}
export * as LogicUtils from './utils/logicUtils';
export * as MathUtils from './utils/mathUtils';
export * as Modules from './modules';
export { positionsDefault } from './globals/positions.default';
//# sourceMappingURL=index.d.ts.map