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
}