export class ScenarioQuestConfigUploadDto {
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
    scenario_id;
    constructor(questConfig, scenarioId) {
        this.scenario_id = scenarioId;
        this.quest_gen_alias = questConfig.questGenAlias;
        this.quest_gen_name = questConfig.questGenName;
        this.initial_author_invest = questConfig.initialAuthorInvest;
        this.starting_price = questConfig.startingPrice;
        this.cite_single_name = questConfig.citeSingleName;
        this.prob_cite_single = questConfig.probCiteSingle;
        this.single_cite_perc = questConfig.singleCitePerc;
        this.cite_single_multiplier = questConfig.citeSingleMultiplier;
        this.prob_random_cite = questConfig.probRandomCite;
        this.random_cite_perc = questConfig.randomCitePerc;
        this.cite_random_multiplier = questConfig.citeRandomMultiplier;
        this.cite_random_prefer_own = questConfig.citeRandomPreferOwn;
    }
}
//# sourceMappingURL=ScenarioQuestConfigUploadDto.js.map