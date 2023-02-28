export declare class Graph {
    limitPathSize: number;
    vertices: number;
    adjList: Map<string, Array<any>>;
    paths: Array<any>;
    constructor(depthSize?: number);
    addVertex(v: any): void;
    addEdge(v: any, w: any): void;
    buildPathways(tokenA: any, tokenB: any): any[];
    buildPathwaysUtil(tokenA: any, tokenB: any, isVisited: any, localPathList: any): void;
    getPathway(): any[];
}
//# sourceMappingURL=Graph.d.ts.map