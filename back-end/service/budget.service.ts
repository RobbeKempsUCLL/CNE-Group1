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
};