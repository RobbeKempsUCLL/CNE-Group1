import { SpendingCategory } from '../types';

export class Spending {
    private id?: number;
    private userEmail: string;
    private title: string;
    private amount: number;
    private category: SpendingCategory;
    private description?: string;
    private date: Date;

    constructor(spending: {
        id?: number;
        userEmail: string;
        title: string;
        amount: number;
        category: SpendingCategory;
        description?: string;
        date?: Date;
    }) {
        this.validate(spending);

        this.id = spending.id;
        this.userEmail = spending.userEmail;
        this.title = spending.title;
        this.amount = spending.amount;
        this.category = spending.category;
        this.description = spending.description || '';
        this.date = spending.date || new Date();
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

    getCategory(): SpendingCategory {
        return this.category;
    }

    getDescription(): string {
        return this.description || '';
    }

    getDate(): Date {
        return this.date;
    }

    validate(spending: {
        userEmail: string;
        title: string;
        amount: number;
        category: string;
    }) {
        if (!spending.userEmail) {
            throw new Error('User is required');
        }
        if (!spending.title) {
            throw new Error('Title is required');
        }
        if (spending.amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }
        if (!spending.category?.trim()) {
            throw new Error('Category is required');
        }
    }
}