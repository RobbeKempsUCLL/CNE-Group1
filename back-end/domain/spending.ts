export class Spending {
    private id?: number;
    private userId: number;
    private amount: number;
    private category: string;
    private description?: string;
    private date: Date;

    constructor(spending: {
        id?: number;
        userId: number;
        amount: number;
        category: string;
        description?: string;
        date?: Date;
    }) {
        this.validate(spending);

        this.id = spending.id;
        this.userId = spending.userId;
        this.amount = spending.amount;
        this.category = spending.category;
        this.description = spending.description || '';
        this.date = spending.date || new Date();
    }

    getId(): number | undefined {
        return this.id;
    }

    getUserId(): number {
        return this.userId;
    }

    getAmount(): number {
        return this.amount;
    }

    getCategory(): string {
        return this.category;
    }

    getDescription(): string {
        return this.description || '';
    }

    getDate(): Date {
        return this.date;
    }

    validate(spending: {
        userId: number;
        amount: number;
        category: string;
    }) {
        if (!spending.userId) {
            throw new Error('User ID is required');
        }
        if (spending.amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }
        if (!spending.category?.trim()) {
            throw new Error('Category is required');
        }
    }
}