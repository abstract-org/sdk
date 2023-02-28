export declare class ScenarioQuestConfigDto {
    quest_gen_alias: string;
    quest_gen_name: string;
    initial_author_invest: number;
    starting_price: number;
    cite_single_name: string;
    prob_cite_single: string;
    single_cite_perc: number;
    cite_single_multiplier: number;
    prob_random_cite: string;
    random_cite_perc: number;
    cite_random_multiplier: number;
    cite_random_prefer_own: boolean;
    constructor(data: any);
    toObj(): {
        questGenAlias: string;
        questGenName: string;
        initialAuthorInvest: number;
        startingPrice: number;
        citeSingleName: string;
        probCiteSingle: string;
        singleCitePerc: number;
        citeSingleMultiplier: number;
        probRandomCite: string;
        randomCitePerc: number;
        citeRandomMultiplier: number;
        citeRandomPreferOwn: boolean;
    };
}
//# sourceMappingURL=ScenarioQuestConfigDto.d.ts.map