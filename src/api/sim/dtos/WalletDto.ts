import { Wallet } from '../../../modules'

export type TWalletBalance = {
    id?: number
    day: number
    balance: number
    quest: {
        name: string
    }
}

export type TWalletNav = {
    id?: number
    wallet_id?: number
    day: number
    usdc_nav: number
    token_nav: number
}

export class WalletDto {
    id: number
    name: string
    type: string
    hash: string
    initial_balance: number
    wallet_balances: TWalletBalance[]
    wallet_navs: TWalletNav[]
    quests: Array<{ name: string }>
    created_at: Date

    constructor(data) {
        this.id = data.id
        this.name = data.name
        this.type = data.type
        this.hash = data.hash
        this.initial_balance = data.initial_balance
        this.wallet_balances = data.wallet_balances
        this.wallet_navs = data.wallet_navs
        this.quests = data.quests
        this.created_at = data.created_at
    }

    toHash(): string {
        return this.hash
    }

    toWallet(): Wallet {
        const wallet = new Wallet()
        const data = this.toObj()
        wallet.name = data.name
        wallet.type = data.type
        wallet.hash = data.hash
        wallet.initialBalance = data.initial_balance
        wallet.balances = data.balances
        wallet.questsCreated = data.questsCreated

        return wallet
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
        const allDays = this.wallet_balances.map((balance) => balance.day)
        const latestDay = Math.max(...allDays)

        return this.wallet_balances.filter(
            (invBalance) => invBalance.day === latestDay
        )
    }
}
