export class ScenarioInvestorConfigUploadDto {
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

    constructor(investorConfig, scenarioId) {
        this.scenario_id = scenarioId
        this.global_swap_threshold = 0
        this.daily_spawn_probability = investorConfig.dailySpawnProbability
        this.inv_gen_alias = investorConfig.invGenAlias
        this.inv_gen_name = investorConfig.invGenName
        this.initial_balance = investorConfig.initialBalance
        this.buy_sell_period_days = investorConfig.buySellPeriodDays
        this.buy_single_perc = investorConfig.buySinglePerc
        this.include_single_name = investorConfig.includeSingleName
        this.buy_sum_perc = investorConfig.buySumPerc
        this.buy_quest_perc = investorConfig.buyQuestPerc
        this.buy_gainer_perc = investorConfig.buyGainerPerc
        this.buy_gainers_frequency = investorConfig.buyGainersFrequency
        this.exclude_single_name = investorConfig.excludeSingleName
        this.swap_inc_frequency = investorConfig.swapIncFrequency
        this.swap_inc_dir = investorConfig.swapIncDir
        this.swap_inc_sum_perc = investorConfig.swapIncSumPerc
        this.swap_inc_by_perc = investorConfig.swapIncByPerc
        this.swap_dec_frequency = investorConfig.swapDecFrequency
        this.swap_dec_dir = investorConfig.swapDecDir
        this.swap_dec_sum_perc = investorConfig.swapDecSumPerc
        this.swap_dec_by_perc = investorConfig.swapDecByPerc
        this.create_quest = investorConfig.createQuest
        this.keep_creating_quests = investorConfig.keepCreatingQuests
        this.keep_creating_period_days = investorConfig.keepCreatingPeriodDays
        this.keep_citing_probability = investorConfig.keepCitingProbability
        this.keep_citing_sum_percentage = investorConfig.keepCitingSumPercentage
        this.keep_citing_price_higher_than =
            investorConfig.keepCitingPriceHigherThan
        this.keep_citing_pos_multiplier = investorConfig.keepCitingPosMultiplier
        this.value_sell_period_days = investorConfig.valueSellPeriodDays
        this.value_sell_amount = investorConfig.valueSellAmount
        this.smart_route_depth = investorConfig.smartRouteDepth
        this.buy_single_amount = investorConfig.buySingleAmount
        this.buy_sum_amount = investorConfig.buySumAmount
        this.swap_inc_sum_amount = investorConfig.swapIncSumAmount
        this.swap_dec_sum_amount = investorConfig.swapDecSumAmount
        this.value_sell_perc = investorConfig.valueSellPerc
    }

    toObj() {
        return {
            dailySpawnProbability: this.daily_spawn_probability,
            invGenAlias: this.inv_gen_alias,
            invGenName: this.inv_gen_name,
            initialBalance: this.initial_balance,
            buySellPeriodDays: this.buy_sell_period_days,
            buySinglePerc: this.buy_single_perc,
            includeSingleName: this.include_single_name,
            buySumPerc: this.buy_sum_perc,
            buyQuestPerc: this.buy_quest_perc,
            buyGainerPerc: this.buy_gainer_perc,
            buyGainersFrequency: this.buy_gainers_frequency,
            excludeSingleName: this.exclude_single_name,
            swapIncFrequency: this.swap_inc_frequency,
            swapIncDir: this.swap_inc_dir,
            swapIncSumPerc: this.swap_inc_sum_perc,
            swapIncByPerc: this.swap_inc_by_perc,
            swapDecFrequency: this.swap_dec_frequency,
            swapDecDir: this.swap_dec_dir,
            swapDecSumPerc: this.swap_dec_sum_perc,
            swapDecByPerc: this.swap_dec_by_perc,
            createQuest: this.create_quest,
            keepCreatingQuests: this.keep_creating_quests,
            keepCreatingPeriodDays: this.keep_creating_period_days,
            keepCitingProbability: this.keep_citing_probability,
            keepCitingSumPercentage: this.keep_citing_sum_percentage,
            keepCitingPriceHigherThan: this.keep_citing_price_higher_than,
            keepCitingPosMultiplier: this.keep_citing_pos_multiplier,
            valueSellPeriodDays: this.value_sell_period_days,
            valueSellAmount: this.value_sell_amount,
            smartRouteDepth: this.smart_route_depth,
            buySingleAmount: this.buy_single_amount,
            buySumAmount: this.buy_sum_amount,
            swapIncSumAmount: this.swap_inc_sum_amount,
            swapDecSumAmount: this.swap_dec_sum_amount,
            valueSellPerc: this.value_sell_perc
        }
    }
}
