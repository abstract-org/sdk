export default class Graph {
    limitPathSize: number
    vertices: number
    adjList: Map<string, Array<any>>
    paths: Array<any>

    constructor(depthSize = 4) {
        this.limitPathSize = depthSize
        this.vertices = 0
        this.adjList = new Map()
        this.paths = []
    }

    addVertex(v) {
        this.vertices += 1
        this.adjList.set(v, [])
    }

    addEdge(v, w) {
        this.adjList.get(v).push(w)
        this.adjList.get(w).push(v)
    }

    buildPathways(tokenA, tokenB) {
        let isVisited = new Array(this.vertices)

        // Call recursive utility
        this.buildPathwaysUtil(tokenA, tokenB, isVisited, [tokenA])

        return this.getPathway()
    }

    buildPathwaysUtil(tokenA, tokenB, isVisited, localPathList) {
        if (tokenA === tokenB) {
            let path = []
            localPathList.forEach((node) =>
                node !== 'undefined' ? path.push(node) : null
            )
            this.paths.push(path)
            return
        }

        // Mark the current node
        isVisited[tokenA] = true

        if (!this.adjList.get(tokenA)) {
            return
        }

        // Recur for all the vertices
        // adjacent to current vertex
        for (let i = 0; i < this.adjList.get(tokenA).length; i++) {
            if (
                !isVisited[this.adjList.get(tokenA)[i]] &&
                localPathList.length <= this.limitPathSize
            ) {
                // store current node
                // in path[]

                localPathList.push(this.adjList.get(tokenA)[i])

                this.buildPathwaysUtil(
                    this.adjList.get(tokenA)[i],
                    tokenB,
                    isVisited,
                    localPathList
                )

                // remove current node
                // in path[]
                localPathList.splice(
                    localPathList.indexOf(this.adjList.get(tokenA)[i]),
                    2
                )
            }
        }

        // Mark the current node
        isVisited[tokenA] = false
    }

    getPathway() {
        return this.paths
    }
}
