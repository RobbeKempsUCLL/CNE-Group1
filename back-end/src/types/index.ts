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