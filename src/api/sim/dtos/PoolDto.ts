import { convertArrayToHashMapByKey } from '../../../utils/logicUtils'
import { Pool } from '../../../modules'
import { PoolDataDto } from './PoolDataDto'
import { PositionDto } from './PositionDto'
import { PosOwnersDto } from './PosOwnersDto'

export class PoolDto {
    id: number
    name: string
    token0: string
    token1: string
    type: string
    hash: string
    created_at: Date
    pool_data: PoolDataDto
    pos: PositionDto[]
    posOwners: PosOwnersDto[]

    constructor(data) {
        this.id = data.id
        this.name = data.name
        this.token0 = data.left.name
        this.token1 = data.right.name
        this.type = data.type
        this.hash = data.hash
        this.created_at = data.created_at
        this.pool_data = new PoolDataDto(data.pool_data[0])
        this.pos = data.position.map((posItem) => new PositionDto(posItem))
        this.posOwners = data.position_owner.map(
            (posOwner) => new PosOwnersDto(posOwner)
        )
    }

    toPool(pos = {}) {
        const pool = new Pool()

        pool.name = this.name
        pool.tokenLeft = this.token0
        pool.tokenRight = this.token1
        pool.type = this.type

        const poolData = this.pool_data.toObj()

        pool.priceToken0 = poolData.token0_price
        pool.priceToken1 = poolData.token1_price
        pool.curLeft = poolData.current_left_lg2
        pool.curRight = poolData.current_right_lg2
        pool.curPrice = poolData.current_price
        pool.curPP = poolData.current_price_point_lg2
        pool.curLiq = poolData.current_liquidity
        pool.volumeToken0 = poolData.volume_token0
        pool.volumeToken1 = poolData.volume_token1
        pool.type = pool.tokenLeft === 'USDC' ? 'QUEST' : 'VALUE_LINK'
        pool.totalSold = poolData.total_sold
        pool.FRESH = poolData.is_fresh
        pool.soldToken0 = poolData.sold_token0
        pool.soldToken1 = poolData.sold_token1

        pool.posOwners = this.posOwners.map((posOwner) => posOwner.toObj())
        const positions = this.pos.map((position) => position.toObj())
        pool.pos = convertArrayToHashMapByKey(positions, 'pp')

        return pool
    }

    toName() {
        return this.name
    }
}
