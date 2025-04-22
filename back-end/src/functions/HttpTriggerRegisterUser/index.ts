import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {UserService} from "../../service/user.service";
import {UserInput} from "../../types";
import {CosmosUserRepository} from "../../repository/user.db";

//

export async function HttpTriggerRegisterUser(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const userService = new UserService(await CosmosUserRepository.getInstance());
        context.log(`Processing request for URL: ${request.url}`);

        const userInput = await request.json() as UserInput;
        const user = await userService.createUser(userInput);

        return {
            status: 201,
            jsonBody: user
        };
    } catch (error) {
        context.log("Error creating user:", error);
        return {
            status: 500,
            jsonBody: { message: "User registration failed", error: (error as Error).message }
        };
    }
}

app.http('HttpTriggerRegisterUser', {
    methods: ['POST'],
    authLevel: 'anonymous', 
    handler: HttpTriggerRegisterUser
});
