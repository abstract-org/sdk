import { SupabaseRepository } from './SupabaseRepository'
import { IQuest, IQuestPersistence } from '../interfaces'

export class QuestPersistenceService implements IQuestPersistence {
    constructor(public dataStoreRepository: SupabaseRepository) {
    }

    getQuests(questHashes: Array<string>): Promise<Array<IQuest>> {
        throw new Error('Not implemented')
    }

    getQuestsByKind(kind: string, limit: number): Promise<Array<IQuest>> {
        throw new Error('Not implemented')
    }

    getQuestsByContent(content: string, limit: number): Promise<Array<IQuest>> {
        throw new Error('Not implemented')
    }

    saveQuest(data: IQuest): Promise<IQuest> {
        throw new Error('Not implemented')
    }

    updateQuest(questId: number, data: IQuest): Promise<IQuest> {
        throw new Error('Not implemented')
    }
}