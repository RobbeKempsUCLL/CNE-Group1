import * as jwt from 'jsonwebtoken';
import { Role } from '../types';

const generateJwtToken = ({ email, role }: { email: string; role: Role }): string => {
    const options = { expiresIn: parseInt(process.env.JWT_EXPIRES_HOURS, 10) * 3600, issuer: 'finance_app' };
    try {
        return jwt.sign({ email, role }, process.env.JWT_SECRET, options);
    } catch (error) {
        console.log(error);
        throw new Error('Error generating JWT token, see server log for details.');
    }
};

const verifyJwtToken = (token: string): { email: string; role: Role } => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string; role: Role };
        return decoded;
    } catch (err) {
        console.error('JWT verification failed:', err);
        throw new Error('Invalid token');
    }
};

export { generateJwtToken, verifyJwtToken };