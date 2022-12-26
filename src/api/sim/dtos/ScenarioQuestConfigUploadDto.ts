export default class ScenarioQuestConfigUploadDto {
    quest_gen_alias: string
    quest_gen_name: string
    initial_author_invest: number
    starting_price: number
    cite_single_name: string
    prob_cite_single: string
    single_cite_perc: number
    cite_single_multiplier: number
    prob_random_cite: string
    random_cite_perc: number
    cite_random_multiplier: number
    cite_random_prefer_own: boolean
    scenario_id: number

    constructor(questConfig, scenarioId) {
        this.scenario_id = scenarioId
        this.quest_gen_alias = questConfig.questGenAlias
        this.quest_gen_name = questConfig.questGenName
        this.initial_author_invest = questConfig.initialAuthorInvest
        this.starting_price = questConfig.startingPrice
        this.cite_single_name = questConfig.citeSingleName
        this.prob_cite_single = questConfig.probCiteSingle
        this.single_cite_perc = questConfig.singleCitePerc
        this.cite_single_multiplier = questConfig.citeSingleMultiplier
        this.prob_random_cite = questConfig.probRandomCite
        this.random_cite_perc = questConfig.randomCitePerc
        this.cite_random_multiplier = questConfig.citeRandomMultiplier
        this.cite_random_prefer_own = questConfig.citeRandomPreferOwn
    }
}
