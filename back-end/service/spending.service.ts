import { CosmosSpendingRepository } from "../repository/spending.db";
import { Spending } from "../domain/spending";
import { SpendingCategory, SpendingInput } from "../types";
import { BudgetService } from "./budget.service";

export class SpendingService {
    private readonly spendingDB: CosmosSpendingRepository;
    private readonly budgetService: BudgetService

    constructor(spendingDB: CosmosSpendingRepository, budgetService: BudgetService) {
        this.spendingDB = spendingDB;
        this.budgetService = budgetService;
    }

    async createSpending(input: SpendingInput): Promise<{ spending: Spending; overBudget: boolean; remaining: number }> {
        
        const spending = new Spending(input);
        const createdSpending = await this.spendingDB.createSpending(spending);

        
        const date = spending.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        
        const { budget } = await this.budgetService.getBudgetByUserEmailAndMonth(input.userEmail, month, year);

        
        const spendings = (await this.getSpendingByUserEmailAndMonth(input.userEmail, month, year)).total;
        
        console.log("get spending ",spendings, month);
        
        const budgetAmount = budget.getAmount();
        const overBudget = spendings > budgetAmount;
        const remaining = budgetAmount - spendings;

        return {
            spending: createdSpending,
            overBudget,
            remaining,
        };
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

    async getSpendingByUserEmailAndMonth(userEmail: string, month: number, year: number): Promise<{ spendings: Spending [], total: number }> {
        const spendings = await this.spendingDB.getSpendingsByUserEmailAndMonth(userEmail, year, month);
        const total = Number(spendings.reduce((sum, s) => sum + s.getAmount(), 0).toFixed(2));
        return { spendings, total };
    }

    async deleteSpending(id: number, userEmail: string): Promise<Spending> {
        if (!id) {
            throw new Error(`Id is required to delete a spending.`);
        }
        return await this.spendingDB.deleteSpending(id, userEmail);
    }
}