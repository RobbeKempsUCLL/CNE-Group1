export class Budget {
    
    private id?: number;
    private userEmail: string;
    private amount: number;
    private description?: string;
    private createdAt: Date;

    constructor(budget: {
        id?: number;
        userEmail: string;
        amount: number;
        description?: string;
        createdAt?: Date;
    }) {
        this.validate(budget);

        this.id = budget.id;
        this.userEmail = budget.userEmail;
        this.amount = budget.amount;
        this.description = budget.description || '';
        this.createdAt = budget.createdAt || new Date();
    }
    getId(): number | undefined {
        return this.id;
    }
    getUserEmail(): string {
        return this.userEmail;
    }
    getAmount(): number {
        return this.amount;
    }
    getDescription(): string {
        return this.description || '';
    }
    getCreatedAt(): Date {
        return this.createdAt;
    }
    setAmount(newAmount: number) {
        if (newAmount <= 0) {
            throw new Error('Amount must be greater than zero.');
        }
        this.amount = newAmount;
    }
    validate(budget: {
        userEmail: string;
        amount: number;
        description?: string;
        createdAt?: Date;
    }) {
        if (!budget.userEmail) {
            throw new Error('User email is required.');
        }
        if (budget.amount <= 0) {
            throw new Error('Amount must be greater than zero.');
        }
    }
};