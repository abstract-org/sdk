export default interface API {
    createQuest(name: string, description: string): boolean
    createPool(name: string, description: string): boolean
    citeQuest(questId: string, userId: string): boolean
    buy(userId: string, itemId: string): boolean
    sell(userId: string, itemId: string): boolean
}
