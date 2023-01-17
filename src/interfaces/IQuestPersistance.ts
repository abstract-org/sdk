import { IQuest } from './IQuest'

export interface IQuestPersistence {
    getQuests(questHashes: Array<string>): Promise<Array<IQuest>>

    getQuestsByKind(kind: string, limit: number): Promise<Array<IQuest>>

    getQuestsByContent(content: string, limit: number): Promise<Array<IQuest>>

    saveQuest(data: IQuest): Promise<IQuest>

    updateQuest(questId: number, data: IQuest): Promise<IQuest>
}