import jwt from 'jsonwebtoken';
import { Role } from '../types';

const generateJwtToken = ({ email, role }: { email: string; role: Role }): string => {
    const options = { expiresIn: parseInt(process.env.JWT_EXPIRES_HOURS!, 10) * 3600, issuer: 'finance_app' };
    try {
        return jwt.sign({ email, role }, process.env.JWT_SECRET!, options);
    } catch (error) {
        console.log(error);
        throw new Error('Error generating JWT token, see server log for details.');
    }
};

export { generateJwtToken };