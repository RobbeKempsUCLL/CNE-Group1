import bcrypt from 'bcrypt';

import { CosmosUserRepository } from '../repository/user.db';
import { User } from '../domain/user';
import { UserInput } from '../types';

// interface UserInput {
//     password: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     role?: string;
// }

export class UserService {
    private userDB: CosmosUserRepository;

    constructor(userDB: CosmosUserRepository) {
        this.userDB = userDB;
    }

    async createUser({ password, firstName, lastName, email, role }: UserInput): Promise<User> {
        console.log(await this.userDB.userExists(email));
        if (await this.userDB.userExists(email)) {
            throw Error('A user with this email address already exists.');
        }

        

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ password: hashedPassword, firstName, lastName, email, role });
        
        return await this.userDB.createUser(user);
    }
}

export default UserService;
