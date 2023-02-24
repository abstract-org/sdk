export class ScenarioWalletConfigUploadDto {
    daily_spawn_probability: string
    inv_gen_alias: string
    inv_gen_name: string
    initial_balance: number
    buy_sell_period_days: number
    buy_single_perc: number
    include_single_name: string
    buy_sum_perc: number
    buy_quest_perc: number
    buy_gainer_perc: number
    buy_gainers_frequency: number
    exclude_single_name: string
    swap_inc_frequency: number
    swap_inc_dir: string
    swap_inc_sum_perc: number
    swap_inc_by_perc: number
    swap_dec_frequency: number
    swap_dec_dir: string
    swap_dec_sum_perc: number
    swap_dec_by_perc: number
    create_quest: string
    keep_creating_quests: string
    keep_creating_period_days: number
    keep_citing_probability: number
    keep_citing_sum_percentage: number
    keep_citing_price_higher_than: number
    keep_citing_pos_multiplier: number
    value_sell_period_days: number
    value_sell_amount: number
    smart_route_depth: number
    buy_single_amount: number
    buy_sum_amount: number
    swap_inc_sum_amount: number
    swap_dec_sum_amount: number
    value_sell_perc: number
    scenario_id: number
    global_swap_threshold: number

    constructor(walletConfig, scenarioId) {
        this.scenario_id = scenarioId
        this.global_swap_threshold = 0
        this.daily_spawn_probability = walletConfig.dailySpawnProbability
        this.inv_gen_alias = walletConfig.invGenAlias
        this.inv_gen_name = walletConfig.invGenName
        this.initial_balance = walletConfig.initialBalance
        this.buy_sell_period_days = walletConfig.buySellPeriodDays
        this.buy_single_perc = walletConfig.buySinglePerc
        this.include_single_name = walletConfig.includeSingleName
        this.buy_sum_perc = walletConfig.buySumPerc
        this.buy_quest_perc = walletConfig.buyQuestPerc
        this.buy_gainer_perc = walletConfig.buyGainerPerc
        this.buy_gainers_frequency = walletConfig.buyGainersFrequency
        this.exclude_single_name = walletConfig.excludeSingleName
        this.swap_inc_frequency = walletConfig.swapIncFrequency
        this.swap_inc_dir = walletConfig.swapIncDir
        this.swap_inc_sum_perc = walletConfig.swapIncSumPerc
        this.swap_inc_by_perc = walletConfig.swapIncByPerc
        this.swap_dec_frequency = walletConfig.swapDecFrequency
        this.swap_dec_dir = walletConfig.swapDecDir
        this.swap_dec_sum_perc = walletConfig.swapDecSumPerc
        this.swap_dec_by_perc = walletConfig.swapDecByPerc
        this.create_quest = walletConfig.createQuest
        this.keep_creating_quests = walletConfig.keepCreatingQuests
        this.keep_creating_period_days = walletConfig.keepCreatingPeriodDays
        this.keep_citing_probability = walletConfig.keepCitingProbability
        this.keep_citing_sum_percentage = walletConfig.keepCitingSumPercentage
        this.keep_citing_price_higher_than =
            walletConfig.keepCitingPriceHigherThan
        this.keep_citing_pos_multiplier = walletConfig.keepCitingPosMultiplier
        this.value_sell_period_days = walletConfig.valueSellPeriodDays
        this.value_sell_amount = walletConfig.valueSellAmount
        this.smart_route_depth = walletConfig.smartRouteDepth
        this.buy_single_amount = walletConfig.buySingleAmount
        this.buy_sum_amount = walletConfig.buySumAmount
        this.swap_inc_sum_amount = walletConfig.swapIncSumAmount
        this.swap_dec_sum_amount = walletConfig.swapDecSumAmount
        this.value_sell_perc = walletConfig.valueSellPerc
    }
}
