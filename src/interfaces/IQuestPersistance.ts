import { IQuest } from './IQuest'
import {QuestUploadDto} from '../api/sim/dtos'

export interface IQuestPersistence {
    getQuests(questHashes: Array<string>): Promise<Array<IQuest>>

    getQuestsByKind(kind: string, limit: number): Promise<Array<IQuest>>

    getQuestsByContent(content: string, limit: number): Promise<Array<IQuest>>

    saveQuest(data: QuestUploadDto): Promise<IQuest>

    updateQuest(questId: number, data: IQuest): Promise<IQuest>
}