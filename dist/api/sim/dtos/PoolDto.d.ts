import { Pool } from '../../../modules';
import { PoolDataDto } from './PoolDataDto';
import { PositionDto } from './PositionDto';
import { PosOwnersDto } from './PosOwnersDto';
export declare class PoolDto {
    id: number;
    name: string;
    token0: string;
    token1: string;
    type: string;
    hash: string;
    created_at: Date;
    pool_data: PoolDataDto;
    pos: PositionDto[];
    posOwners: PosOwnersDto[];
    constructor(data: any);
    toPool(pos?: {}): Pool;
    toName(): string;
}
//# sourceMappingURL=PoolDto.d.ts.map