import { Service } from 'typedi'
import { SupabaseRepository } from './SupabaseRepository'
import { IQuest } from '../interfaces'
import { IQuestPersistance } from '../interfaces/IQuestPersistance'

@Service()
export class QuestPersistanceService implements IQuestPersistance {
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