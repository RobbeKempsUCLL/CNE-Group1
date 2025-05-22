export type Role = 'admin' | 'user';

export type UserInput = {
    id?: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: Role;
};

export type AuthenticationResponse = {
    token: string;
    email: string;
    fullname: string;
    role: string;
};

export type SpendingCategory = 'housing' | 'food' | 'transportation' | 'entertainment' | 'utilities' | 'education' | 'clothing' | 'savings' | 'other';
export type IncomeCategory = 'earned' | 'passive' | 'assistance' | 'other';

export type SpendingInput = {
    id?: number;
    title: string;
    userEmail: string;
    amount: number;
    category: SpendingCategory;
    description?: string;
    date?: Date;
};

export type IncomeInput = {
    id?: number;
    title: string;
    userEmail: string;
    amount: number;
    category: IncomeCategory;
    description?: string;
    date?: Date;
};

export type BudgetInput = {
    id?: number;
    userEmail: string;
    amount: number;
    month: number;
    year: number;
    description?: string;
    createdAt?: Date;
}