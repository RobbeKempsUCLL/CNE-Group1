export class Budget {
    
    private id?: number;
    private userEmail: string;
    private amount: number;
    private month: Date;
    private description?: string;
    private createdAt: Date;

    constructor(budget: {
        id?: number;
        userEmail: string;
        amount: number;
        month: number;
        year: number;
        description?: string;
        createdAt?: Date;
    }) {
        this.validate(budget);

        this.id = budget.id;
        this.userEmail = budget.userEmail;
        this.amount = budget.amount;
        this.month = new Date(budget.year, budget.month); 
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
    getMonth(): Date {
        return this.month;
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
        month: number;
        year: number;
        description?: string;
        createdAt?: Date;
    }) {
        if (!budget.userEmail) {
            throw new Error('User email is required.');
        }
        if (budget.amount <= 0) {
            throw new Error('Amount must be greater than zero.');
        }
        if (!budget.month) {
            throw new Error('Month is required.');
        }
        if(budget.month  < 1 || budget.month > 12) {
            throw new Error('Month must be between 1 and 12.');
        }
    }
};