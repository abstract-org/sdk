import {QuestDto, QuestUploadDto} from '../api/sim/dtos'
import { IQuest, IPool, IWallet } from './index'
import { QueryFilterType } from '../types'

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
        filter: QueryFilterType,
        options?: IQueryOptions
    ): Promise<Array<IWallet>>

    createWallet(data: IWallet): Promise<IWallet>

    updateWallet(id: number, data: IWallet): Promise<IWallet>

    findQuestsByFilter(
        filter: QueryFilterType,
        options?: IQueryOptions
    ): Promise<QuestDto[]>

    createQuest(data: QuestUploadDto): Promise<IQuest>

    updateQuest(id: number, data: Partial<QuestUploadDto>): Promise<IQuest>
}
