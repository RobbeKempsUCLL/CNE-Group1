import { CosmosBudgetRepository } from "../repository/budget.db";
import { Budget } from "../domain/budget";
import { BudgetInput } from "../types";

export class BudgetService {
    private readonly budgetDB: CosmosBudgetRepository;

    constructor(budgetDB: CosmosBudgetRepository) {
        this.budgetDB = budgetDB;
    }

    async createBudget({ userEmail, amount, month, year, description }: BudgetInput): Promise<Budget> {
        const budget = new Budget({ userEmail, amount, month, year, description });
        return await this.budgetDB.createBudget(budget);
    }

    async getBudgetsByUserEmail(userEmail: string): Promise<{ budgets: Budget[]}> {
        const budgets = await this.budgetDB.getBudgetsByUserEmail(userEmail);
        return {budgets}; 
    }

    async getBudgetByUserEmailAndMonth(userEmail: string, month: number, year: number): Promise<{ budget: Budget}> {
        const budget = await this.budgetDB.getBudgetByUserEmailAndMonth(userEmail, month, year);
        if (!budget) {
            throw new Error(`Budget not found for user ${userEmail} for month ${month} and year ${year}.`);
        }
        return { budget};
    }
};