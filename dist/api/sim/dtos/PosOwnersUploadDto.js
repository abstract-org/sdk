export class PosOwnersUploadDto {
    amt0;
    amt1;
    hash;
    native;
    pmax;
    pmin;
    type;
    pool_id;
    investor_id;
    constructor(data, poolId, investorId) {
        this.amt0 = data.amt0;
        this.amt1 = data.amt1;
        this.hash = data.hash;
        this.native = data.native;
        this.pmax = data.pmax;
        this.pmin = data.pmin;
        this.type = data.type;
        this.pool_id = poolId;
        this.investor_id = investorId;
    }
}
//# sourceMappingURL=PosOwnersUploadDto.js.map