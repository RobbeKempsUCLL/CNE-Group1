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

export type SpendingInput = {
    id?: number;
    userId: number;
    amount: number;
    category: SpendingCategory;
    description?: string;
    date?: Date;
};