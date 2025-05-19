import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {UserService} from "../../service/user.service";
import {UserInput} from "../../types";
import {CosmosUserRepository} from "../../repository/user.db";

export async function httpTriggerAuth(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const userService = new UserService(await CosmosUserRepository.getInstance());
        const userInput = await request.json() as UserInput;

        const authResponse = await userService.authenticate(userInput);

        return {
            status: 200,
            jsonBody: authResponse
        };

    } catch (error) {
        context.log("Error during authentication:", error);
        return {
            status: 401,
            jsonBody: { message: "Authentication failed", error: (error as Error).message }
        };
    }
};

app.http('httpTriggerAuth', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: httpTriggerAuth
});
