import {
    IDataStoreRepository,
    IQuestPersistence,
    IQuestCreate,
    IQuestUpdate
} from '../interfaces'
import { Quest } from '../modules'
import { QueryFilterType } from '../types'

export class QuestPersistenceService implements IQuestPersistence {
    constructor(private dataStoreRepository: IDataStoreRepository) {}

    async getQuests(questHashes: Array<string>): Promise<Array<Quest>> {
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

        return questDtoList.map((questDto) => Quest.instantiate(questDto))
    }

    async getQuestsByKind(kind: string, limit: number): Promise<Array<Quest>> {
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

        return questDtoList.map((questDto) => Quest.instantiate(questDto))
    }

    async getQuestsByContent(
        content: string,
        limit: number
    ): Promise<Array<Quest>> {
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

        return questDtoList.map((questDto) => Quest.instantiate(questDto))
    }

    async saveQuest(data: IQuestCreate): Promise<Quest> {
        const newQuestDto = await this.dataStoreRepository.createQuest(data)

        return Quest.instantiate(newQuestDto)
    }

    async updateQuest(questId: number, data: IQuestUpdate): Promise<Quest> {
        const updatedQuestDto = await this.dataStoreRepository.updateQuest(
            questId,
            data
        )

        return Quest.instantiate(updatedQuestDto)
    }
}
