import { CosmosSpendingRepository } from "../repository/spending.db";
import { Spending } from "../domain/spending";
import { SpendingCategory, SpendingInput } from "../types";

export class SpendingService {
    private readonly spendingDB: CosmosSpendingRepository;

    constructor(spendingDB: CosmosSpendingRepository) {
        this.spendingDB = spendingDB;
    }

    async createSpending({ userEmail,title, amount, category, description, date }: SpendingInput): Promise<Spending> {
        const spending = new Spending({ userEmail,title, amount, category, description, date });
        return await this.spendingDB.createSpending(spending);
    }

    async getSpendingsByUserEmail(userEmail: string): Promise<{ spendings: Spending[], total: number }> {
        const spendings = await this.spendingDB.getSpendingsByUserEmail(userEmail);
        const total = Number(spendings.reduce((sum, s) => sum + s.getAmount(), 0).toFixed(2));
        return { spendings, total };
    }

    async getSpendingsByUserEmailAndCategory(userEmail: string, category: SpendingCategory): Promise<{ spendings: Spending[], total: number }> {
        const spendings = await this.spendingDB.getSpendingsByUserEmailAndCategory(userEmail, category);
        const total = Number(spendings.reduce((sum, s) => sum + s.getAmount(), 0).toFixed(2));
        return { spendings, total };
    }
}