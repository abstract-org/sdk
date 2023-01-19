import { SupabaseRepository } from './SupabaseRepository'
import {
    IDataStoreRepository,
    IQuest,
    IQuestPersistence,
    QuestUploadDto
} from '../interfaces'

export class QuestPersistenceService implements IQuestPersistence {
    constructor(private dataStoreRepository: IDataStoreRepository) {}

    async getQuests(questHashes: Array<string>): Promise<Array<IQuest>> {
        const hashesAsStr = questHashes.map((v) => `"${v}"`).join(',')
        const filter = {
            field: 'hash',
            op: 'in',
            value: `(${hashesAsStr})`
        }
        const questDtoList = await this.dataStoreRepository.findQuestsByFilter(
            filter
        )

        return questDtoList.map((questDto) => questDto.toQuest())
    }

    async getQuestsByKind(kind: string, limit: number): Promise<Array<IQuest>> {
        const filter = {
            field: 'kind',
            op: 'eq',
            value: kind
        }
        const questDtoList = await this.dataStoreRepository.findQuestsByFilter(
            filter,
            { limit }
        )

        return questDtoList.map((questDto) => questDto.toQuest())
    }

    async getQuestsByContent(
        content: string,
        limit: number
    ): Promise<Array<IQuest>> {
        const filter = {
            field: 'content',
            op: 'eq',
            value: content
        }
        const questDtoList = await this.dataStoreRepository.findQuestsByFilter(
            filter,
            { limit }
        )

        return questDtoList.map((questDto) => questDto.toQuest())
    }

    async saveQuest(data: QuestUploadDto): Promise<IQuest> {
        return this.dataStoreRepository.createQuest(data)
    }

    async updateQuest(
        questId: number,
        data: Partial<QuestUploadDto>
    ): Promise<IQuest> {
        return this.dataStoreRepository.updateQuest(questId, data)
    }
}
