import { IQuest, IQuestCreate, IQuestUpdate } from './IQuest'

export interface IQuestPersistence {
    getQuests(questHashes: Array<string>): Promise<Array<IQuest>>

    getQuestsByKind(kind: string, limit: number): Promise<Array<IQuest>>

    getQuestsByContent(content: string, limit: number): Promise<Array<IQuest>>

    saveQuest(data: IQuestCreate): Promise<IQuest>

    updateQuest(hash: string, data: IQuestUpdate): Promise<IQuest>
}
