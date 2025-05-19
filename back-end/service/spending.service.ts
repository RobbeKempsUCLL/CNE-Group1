import { CosmosSpendingRepository } from "../repository/spending.db";
import { Spending } from "../domain/spending";
import { SpendingInput } from "../types";

export class SpendingService {
    private readonly spendingDB: CosmosSpendingRepository;

    constructor(spendingDB: CosmosSpendingRepository) {
        this.spendingDB = spendingDB;
    }

    async createSpending({ userEmail,title, amount, category, description, date }: SpendingInput): Promise<Spending> {
        const spending = new Spending({ userEmail,title, amount, category, description, date });
        return await this.spendingDB.createSpending(spending);
    }

    // async getSpendingsByUserEmail(userEmail: string): Promise<Spending[]> {
    //     return await this.spendingDB.getSpendingsByUserEmail(userEmail);
    // }
}