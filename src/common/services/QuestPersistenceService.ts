import {
    IDataStoreRepository,
    IQuestPersistence,
    IQuest,
    IQuestCreate,
    IQuestUpdate
} from '../interfaces'
import { QueryFilterType } from '../types'

export class QuestPersistenceService implements IQuestPersistence {
    constructor(private dataStoreRepository: IDataStoreRepository) {}

    async getQuests(questHashes: Array<string>): Promise<Array<IQuest>> {
        const hashesAsStr = questHashes.map((v) => `"${v}"`).join(',')
        const filters: QueryFilterType = [
            {
                propertyName: 'hash',
                filterType: 'in',
                value: `(${hashesAsStr})`
            }
        ]
        const questDtoList = await this.dataStoreRepository.findQuestsByFilter(
            filters
        )

        return questDtoList
    }

    async getQuestsByKind(kind: string, limit: number): Promise<Array<IQuest>> {
        const filters: QueryFilterType = [
            {
                propertyName: 'kind',
                filterType: 'eq',
                value: kind
            }
        ]
        const questDtoList = await this.dataStoreRepository.findQuestsByFilter(
            filters,
            { limit }
        )

        return questDtoList
    }

    async getQuestsByContent(
        content: string,
        limit: number
    ): Promise<Array<IQuest>> {
        const filters: QueryFilterType = [
            {
                propertyName: 'content',
                filterType: 'eq',
                value: content
            }
        ]
        const questDtoList = await this.dataStoreRepository.findQuestsByFilter(
            filters,
            { limit }
        )

        return questDtoList
    }

    async saveQuest(data: IQuestCreate): Promise<IQuest> {
        const newQuestDto = await this.dataStoreRepository.createQuest(data)

        return newQuestDto
    }

    async updateQuest(questHash: string, data: IQuestUpdate): Promise<IQuest> {
        const updatedQuestDto = await this.dataStoreRepository.updateQuest(
            questHash,
            data
        )

        return updatedQuestDto
    }
}
