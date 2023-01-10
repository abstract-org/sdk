export interface IQuest {
    id: String;
    content: String;
    hash: String;
    kind: String;
    image?: any;
}

export interface IClusterData {
    cited: number,
    followedBy: Array<IQuest>,
    following: Array<IQuest>
}