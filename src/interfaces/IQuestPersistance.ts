import { Quest } from '../modules'
import { IQuestCreate, IQuestUpdate } from './IQuest'

export interface IQuestPersistence {
    getQuests(questHashes: Array<string>): Promise<Array<Quest>>

    getQuestsByKind(kind: string, limit: number): Promise<Array<Quest>>

    getQuestsByContent(content: string, limit: number): Promise<Array<Quest>>

    saveQuest(data: IQuestCreate): Promise<Quest>

    updateQuest(questId: number, data: IQuestUpdate): Promise<Quest>
}
