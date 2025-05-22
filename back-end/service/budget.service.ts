import { CosmosBudgetRepository } from "../repository/budget.db";
import { Budget } from "../domain/budget";
import { BudgetInput } from "../types";

export class BudgetService {
    private readonly budgetDB: CosmosBudgetRepository;

    constructor(budgetDB: CosmosBudgetRepository) {
        this.budgetDB = budgetDB;
    }

    async createBudget({ userEmail, amount, description }: BudgetInput): Promise<Budget> {
        const budget = new Budget({ userEmail, amount, description });
        return await this.budgetDB.createBudget(budget);
    }

    async getBudgetsByUserEmail(userEmail: string): Promise<{ budgets: Budget[]}> {
        const budgets = await this.budgetDB.getBudgetsByUserEmail(userEmail);
        return {budgets}; 
    }

    async getBudgetByUserEmailAndMonth(userEmail: string, month: number, year: number): Promise<{ budget: Budget}> {
        console.log(`Fetching budget for user: ${userEmail}, month: ${month}, year: ${year}`);
        const budget = await this.budgetDB.getBudgetByUserEmailAndMonth(userEmail, month, year);
        if (!budget) {
            throw new Error(`Budget not found for user ${userEmail} for month ${month} and year ${year}.`);
        }
        return { budget};
    }
    async deleteBudget(id: number, userEmail: string): Promise<void> {
        await this.budgetDB.deleteBudget(id, userEmail);
    }
    
    async updateBudget(id:number, userEmail: string, amount:number): Promise<Budget> {
        return await this.budgetDB.updateBudgetAmount(id, userEmail, amount);
    }
};