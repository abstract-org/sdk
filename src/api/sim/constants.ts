export const RELATION_TYPE = {
    INVESTOR: 'wallet',
    QUEST: 'quest',
    POOL: 'pool'
}

export const TABLE = {
    quest: 'quest',
    wallet: 'wallet',
    wallet_balances: 'wallet_balances',
    wallet_navs: 'wallet_navs',
    pool: 'pool',
    pool_data: 'pool_data',
    position: 'position',
    position_owner: 'position_owner',
    snapshot_wallet: 'snapshot_wallet',
    snapshot_quest: 'snapshot_quest',
    snapshot_pool: 'snapshot_pool',
    swap: 'swap',
    log: 'log',
    snapshot: 'snapshot',
    user: 'user',
    snapshot_totals: 'snapshot_totals',
    scenario: 'scenario',
    scenario_wallet_config: 'scenario_wallet_config',
    scenario_quest_config: 'scenario_quest_config'
}

export const getQuerySnapshotById = ({ T } = { T: TABLE }) => `*,
        creator: creator_id ( email ),
        scenario (
            ${T.scenario_wallet_config}(*),
            ${T.scenario_quest_config}(*)
        ),
        ${T.wallet}(
            *,
            ${T.wallet_balances}(
                ${T.quest}(name),
                balance,
                day
            ),
            ${T.wallet_navs}(*),
            quests:${T.quest}(name)
        ),
        ${T.pool} (
            *,
            left:token0(name),
            right:token1(name),
            ${T.pool_data}(*),
            ${T.position}(*),
            ${T.position_owner}(*),
            ${T.log}(
                *, 
                pool (name),
                wallet (hash)
            ),
            ${T.swap}(*)
        ),
        ${T.quest}(
            *,
            wallet (
                name,
                hash
            )
        )
        `
