import { Investor } from '../../../modules'

export type TInvestorBalance = {
    id?: number
    day: number
    balance: number
    quest: {
        name: string
    }
}

export type TInvestorNav = {
    id?: number
    investor_id?: number
    day: number
    usdc_nav: number
    token_nav: number
}

export class InvestorDto {
    id: number
    name: string
    type: string
    hash: string
    initial_balance: number
    investor_balances: TInvestorBalance[]
    investor_navs: TInvestorNav[]
    quests: Array<{ name: string }>
    created_at: Date

    constructor(data) {
        this.id = data.id
        this.name = data.name
        this.type = data.type
        this.hash = data.hash
        this.initial_balance = data.initial_balance
        this.investor_balances = data.investor_balances
        this.investor_navs = data.investor_navs
        this.quests = data.quests
        this.created_at = data.created_at
    }

    toHash(): string {
        return this.hash
    }

    toInvestor(): Investor {
        const investor = new Investor()
        const data = this.toObj()
        investor.name = data.name
        investor.type = data.type
        investor.hash = data.hash
        investor.initialBalance = data.initial_balance
        investor.balances = data.balances
        investor.questsCreated = data.questsCreated

        return investor
    }

    toObj() {
        const balances = this._getLatestDayBalances().reduce(
            (resultObj, item) => {
                resultObj[item.quest.name] = item.balance

                return resultObj
            },
            { USDC: 0 }
        )

        const questsCreated = this.quests.map((q) => q.name)

        return {
            id: this.id,
            name: this.name,
            type: this.type,
            hash: this.hash,
            initial_balance: this.initial_balance,
            balances,
            questsCreated
        }
    }

    private _getLatestDayBalances() {
        const allDays = this.investor_balances.map((balance) => balance.day)
        const latestDay = Math.max(...allDays)

        return this.investor_balances.filter(
            (invBalance) => invBalance.day === latestDay
        )
    }
}
