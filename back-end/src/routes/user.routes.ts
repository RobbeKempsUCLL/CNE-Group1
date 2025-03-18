import { Router, Request, Response, NextFunction } from 'express';
import UserService from '../service/user.service';
import { UserInput } from '../types';
import { CosmosUserRepository } from '../repository/user.db';

const userRouter = Router();

(async () => {
    try {
        const userService = new UserService(await CosmosUserRepository.getInstance());

        userRouter.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userInput = req.body as UserInput;
                const user = await userService.createUser(userInput);
                res.status(201).json(user);
            } catch (error) {
                next(error);
            }
        });

    } catch (error) {
        console.error("Failed to initialize user service:", error);
    }
})();

export default userRouter;
