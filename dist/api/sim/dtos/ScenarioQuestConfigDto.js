export class ScenarioQuestConfigDto {
    quest_gen_alias;
    quest_gen_name;
    initial_author_invest;
    starting_price;
    cite_single_name;
    prob_cite_single;
    single_cite_perc;
    cite_single_multiplier;
    prob_random_cite;
    random_cite_perc;
    cite_random_multiplier;
    cite_random_prefer_own;
    constructor(data) {
        this.quest_gen_alias = data.quest_gen_alias;
        this.quest_gen_name = data.quest_gen_name;
        this.initial_author_invest = data.initial_author_invest;
        this.starting_price = data.starting_price;
        this.cite_single_name = data.cite_single_name;
        this.prob_cite_single = data.prob_cite_single;
        this.single_cite_perc = data.single_cite_perc;
        this.cite_single_multiplier = data.cite_single_multiplier;
        this.prob_random_cite = data.prob_random_cite;
        this.random_cite_perc = data.random_cite_perc;
        this.cite_random_multiplier = data.cite_random_multiplier;
        this.cite_random_prefer_own = data.cite_random_prefer_own;
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
        };
    }
}
//# sourceMappingURL=ScenarioQuestConfigDto.js.map