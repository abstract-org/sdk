export const RELATION_TYPE = {
    INVESTOR: 'investor',
    QUEST: 'quest',
    POOL: 'pool'
}

export const TABLE = {
    quest: 'quest',
    investor: 'investor',
    investor_balances: 'investor_balances',
    investor_navs: 'investor_navs',
    pool: 'pool',
    pool_data: 'pool_data',
    position: 'position',
    position_owner: 'position_owner',
    snapshot_investor: 'snapshot_investor',
    snapshot_quest: 'snapshot_quest',
    snapshot_pool: 'snapshot_pool',
    swap: 'swap',
    log: 'log',
    snapshot: 'snapshot',
    user: 'user',
    snapshot_totals: 'snapshot_totals',
    scenario: 'scenario',
    scenario_investor_config: 'scenario_investor_config',
    scenario_quest_config: 'scenario_quest_config'
}

export const getQuerySnapshotById = ({ T } = { T: TABLE }) => `*,
        creator: creator_id ( email ),
        scenario (
            ${T.scenario_investor_config}(*),
            ${T.scenario_quest_config}(*)
        ),
        ${T.investor}(
            *,
            ${T.investor_balances}(
                ${T.quest}(name),
                balance,
                day
            ),
            ${T.investor_navs}(*),
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
                investor (hash)
            ),
            ${T.swap}(*)
        ),
        ${T.quest}(
            *,
            investor (
                name,
                hash
            )
        )
        `
