import { CosmosIncomeRepository } from "../repository/income.db";
import { Income } from "../domain/income";
import { IncomeCategory, IncomeInput } from "../types";

export class IncomeService {
    private readonly incomeDB: CosmosIncomeRepository;

    constructor(incomeDB: CosmosIncomeRepository) {
        this.incomeDB = incomeDB;
    }

    async createIncome({ userEmail,title, amount, category, description, date }: IncomeInput): Promise<Income> {
        const income = new Income({ userEmail, title, amount, category, description, date });
        return await this.incomeDB.createIncome(income);
    }

    async getIncomeByUserEmail(userEmail: string): Promise<{ income: Income[], total: number }> {
        const income = await this.incomeDB.getIncomeByUserEmail(userEmail);
        const total = Number(income.reduce((sum, s) => sum + s.getAmount(), 0).toFixed(2));
        return { income, total };
    }

    async getIncomeByUserEmailAndCategory(userEmail: string, category: IncomeCategory): Promise<{ income: Income[], total: number }> {
        const income = await this.incomeDB.getIncomeByUserEmailAndCategory(userEmail, category);
        const total = Number(income.reduce((sum, s) => sum + s.getAmount(), 0).toFixed(2));
        return { income, total };
    }

    async deleteIncome(id: number, userEmail: string): Promise<Income> {
        if (!id) {
            throw new Error(`Id is required to delete an income instance.`);
        }
        return await this.incomeDB.deleteIncome(id, userEmail);
    }

    async updateIncome(incomeInput: IncomeInput): Promise<Income> {
    if (!incomeInput.id) {
        throw new Error("Income ID is required for update.");
    }

    const income = new Income(incomeInput); // your domain class
    return await this.incomeDB.updateIncome(income);
}
}