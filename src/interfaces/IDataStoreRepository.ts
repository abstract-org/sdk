import { IQuest, IPool, IWallet, QuestDto, QuestUploadDto } from './index'
import { QueryFilterType } from '../types'

export interface IQueryFilter {
    field: string
    op: string
    value: string
}

export interface IQueryOptions {
    limit?: number
}

export interface IDataStoreRepository {
    findPoolByFilter(
        filters: QueryFilterType,
        options?: IQueryOptions
    ): Promise<Array<IPool>>

    createPool(data: IPool): Promise<IPool>

    updatePool(id: number, data: IPool): Promise<IPool>

    findWalletByFilter(
        filter: IQueryFilter,
        options?: IQueryOptions
    ): Promise<IWallet>

    createWallet(data: IWallet): Promise<IWallet>

    updateWallet(id: number, data: IWallet): Promise<IWallet>

    findQuestsByFilter(
        filter: IQueryFilter,
        options?: IQueryOptions
    ): Promise<QuestDto[]>

    createQuest(data: QuestUploadDto): Promise<IQuest>

    updateQuest(id: number, data: Partial<QuestUploadDto>): Promise<IQuest>
}
