export class PoolUploadDto {
    name;
    token0;
    token1;
    type;
    hash;
    created_at;
    constructor(data, questNameToQuestId) {
        this.name = data.name;
        this.type = data.type;
        this.token0 = questNameToQuestId.get(data.tokenLeft);
        this.token1 = questNameToQuestId.get(data.tokenRight);
        this.hash = data.hash || 'hash';
        this.created_at = data.created_at || new Date();
    }
}
//# sourceMappingURL=PoolUploadDto.js.map