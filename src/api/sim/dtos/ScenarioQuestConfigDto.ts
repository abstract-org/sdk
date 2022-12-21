export class ScenarioQuestConfigDto {
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

    constructor(data) {
        this.quest_gen_alias = data.quest_gen_alias
        this.quest_gen_name = data.quest_gen_name
        this.initial_author_invest = data.initial_author_invest
        this.starting_price = data.starting_price
        this.cite_single_name = data.cite_single_name
        this.prob_cite_single = data.prob_cite_single
        this.single_cite_perc = data.single_cite_perc
        this.cite_single_multiplier = data.cite_single_multiplier
        this.prob_random_cite = data.prob_random_cite
        this.random_cite_perc = data.random_cite_perc
        this.cite_random_multiplier = data.cite_random_multiplier
        this.cite_random_prefer_own = data.cite_random_prefer_own
    }

    toObj() {
        return {
            questGenAlias: this.quest_gen_alias,
            questGenName: this.quest_gen_name,
            initialAuthorInvest: this.initial_author_invest,
            startingPrice: this.starting_price,
            citeSingleName: this.cite_single_name,
            probCiteSingle: this.prob_cite_single,
            singleCitePerc: this.single_cite_perc,
            citeSingleMultiplier: this.cite_single_multiplier,
            probRandomCite: this.prob_random_cite,
            randomCitePerc: this.random_cite_perc,
            citeRandomMultiplier: this.cite_random_multiplier,
            citeRandomPreferOwn: this.cite_random_prefer_own
        }
    }
}
