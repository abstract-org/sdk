export class ScenarioWalletConfigDto {
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

    constructor(data) {
        this.daily_spawn_probability = data.daily_spawn_probability
        this.inv_gen_alias = data.inv_gen_alias
        this.inv_gen_name = data.inv_gen_name
        this.initial_balance = data.initial_balance
        this.buy_sell_period_days = data.buy_sell_period_days
        this.buy_single_perc = data.buy_single_perc
        this.include_single_name = data.include_single_name
        this.buy_sum_perc = data.buy_sum_perc
        this.buy_quest_perc = data.buy_quest_perc
        this.buy_gainer_perc = data.buy_gainer_perc
        this.buy_gainers_frequency = data.buy_gainers_frequency
        this.exclude_single_name = data.exclude_single_name
        this.swap_inc_frequency = data.swap_inc_frequency
        this.swap_inc_dir = data.swap_inc_dir
        this.swap_inc_sum_perc = data.swap_inc_sum_perc
        this.swap_inc_by_perc = data.swap_inc_by_perc
        this.swap_dec_frequency = data.swap_dec_frequency
        this.swap_dec_dir = data.swap_dec_dir
        this.swap_dec_sum_perc = data.swap_dec_sum_perc
        this.swap_dec_by_perc = data.swap_dec_by_perc
        this.create_quest = data.create_quest
        this.keep_creating_quests = data.keep_creating_quests
        this.keep_creating_period_days = data.keep_creating_period_days
        this.keep_citing_probability = data.keep_citing_probability
        this.keep_citing_sum_percentage = data.keep_citing_sum_percentage
        this.keep_citing_price_higher_than = data.keep_citing_price_higher_than
        this.keep_citing_pos_multiplier = data.keep_citing_pos_multiplier
        this.value_sell_period_days = data.value_sell_period_days
        this.value_sell_amount = data.value_sell_amount
        this.smart_route_depth = data.smart_route_depth
        this.buy_single_amount = data.buy_single_amount
        this.buy_sum_amount = data.buy_sum_amount
        this.swap_inc_sum_amount = data.swap_inc_sum_amount
        this.swap_dec_sum_amount = data.swap_dec_sum_amount
        this.value_sell_perc = data.value_sell_perc
    }

    toObj() {
        return {
            dailySpawnProbability: String(this.daily_spawn_probability),
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
            buySingleAmount: this.buy_single_amount || 0,
            buySumAmount: this.buy_sum_amount || 0,
            swapIncSumAmount: this.swap_inc_sum_amount || 0,
            swapDecSumAmount: this.swap_dec_sum_amount || 0,
            valueSellPerc: this.value_sell_perc || 0
        }
    }
}
