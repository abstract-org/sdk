import {
    IDataStoreRepository,
    IQuest,
    IQuestPersistence,
} from '../interfaces'
import {QuestUploadDto} from '../api/sim/dtos'
import { QueryFilterType } from '../types'

export class QuestPersistenceService implements IQuestPersistence {
    constructor(private dataStoreRepository: IDataStoreRepository) {
    }

    async getQuests(questHashes: Array<string>): Promise<Array<any>> {
        const hashesAsStr = questHashes.map((v) => `"${v}"`).join(',')
        const filters: QueryFilterType = [{
            propertyName: 'hash',
            filterType: 'in',
            value: `(${hashesAsStr})`
        }]
        const questDtoList = await this.dataStoreRepository.findQuestsByFilter(
            filters
        )

        return questDtoList.map((questDto) => questDto.toQuest())
    }

    async getQuestsByKind(kind: string, limit: number): Promise<Array<any>> {
        const filters: QueryFilterType = [{
            propertyName: 'kind',
            filterType: 'eq',
            value: kind
        }]
        const questDtoList = await this.dataStoreRepository.findQuestsByFilter(
            filters,
            { limit }
        )

        return questDtoList.map((questDto) => questDto.toQuest())
    }

    async getQuestsByContent(
        content: string,
        limit: number
    ): Promise<Array<any>> {
        const filters: QueryFilterType = [{
            propertyName: 'content',
            filterType: 'eq',
            value: content
        }]
        const questDtoList = await this.dataStoreRepository.findQuestsByFilter(
            filters,
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
