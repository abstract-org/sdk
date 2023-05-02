export interface IPoolState {
    curPrice: number
    curLeft: number
    curRight: number
    curPP: number
    curLiq: number
    questLeftPrice: number
    questRightPrice: number
    questLeftVolume: number
    questRightVolume: number
}

export interface PoolStatePopulated {
    hash: string
    block_hash?: string
    cur_price: number
    cur_liq: number
    cur_right: number | string
    cur_left: number | string
    cur_pp: number | string
    quest_left_volume: number
    quest_right_volume: number
    quest_left_price: number
    quest_right_price: number
}
