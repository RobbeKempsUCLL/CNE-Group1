import bcrypt from 'bcrypt';

import { CosmosUserRepository } from '../repository/user.db';
import { User } from '../domain/user';
import { UserInput, AuthenticationResponse } from '../types';
import { generateJwtToken } from '../util/jwt';

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

    async authenticate({ email, password }: UserInput): Promise<AuthenticationResponse> {
        const user = await this.userDB.getUser(email); // Pass email directly
    
        const isValidPassword = await bcrypt.compare(password, user.getPassword());
        if (!isValidPassword) {
            throw new Error("Email or password is incorrect");
        }
    
        return {
            token: generateJwtToken({ email, role: user.getRole() }),
            email: email,
            fullname: `${user.getFirstName()} ${user.getLastName()}`,
            role: user.getRole(),
        };
    }    
}

export default UserService;
