import { IncomeCategory } from '../types';

export class Income {
    private id?: number;
    private userEmail: string;
    private title: string;
    private amount: number;
    private category: IncomeCategory;
    private description?: string;
    private date: Date;

    constructor(income: {
        id?: number;
        userEmail: string;
        title: string;
        amount: number;
        category: IncomeCategory;
        description?: string;
        date?: Date;
    }) {
        this.validate(income);

        this.id = income.id;
        this.userEmail = income.userEmail;
        this.title = income.title;
        this.amount = income.amount;
        this.category = income.category;
        this.description = income.description || '';
        this.date = income.date || new Date();
    }

    getId(): number | undefined {
        return this.id;
    }

    getUserEmail(): string {
        return this.userEmail;
    }

    getTitle(): string {
        return this.title;
    }

    getAmount(): number {
        return this.amount;
    }

    getCategory(): IncomeCategory {
        return this.category;
    }

    getDescription(): string {
        return this.description || '';
    }

    getDate(): Date {
        return this.date;
    }

    validate(income: {
        userEmail: string;
        title: string;
        amount: number;
        category: string;
    }) {
        if (!income.userEmail) {
            throw new Error('User is required');
        }
        if (!income.title) {
            throw new Error('Title is required');
        }
        if (income.amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }
        if (!income.category?.trim()) {
            throw new Error('Category is required');
        }
    }
}