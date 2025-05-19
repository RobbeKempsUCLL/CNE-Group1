import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {UserService} from "../../service/user.service";
import {CosmosUserRepository} from "../../repository/user.db";

export async function httpTriggerGetUser(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);


    const userService = new UserService(await CosmosUserRepository.getInstance());
    const email = request.query.get('email');

    const user = await userService.getUser(email);
    return {
        status: user ? 200 : 404,
        body: user ? JSON.stringify(user) : JSON.stringify({ message: "User not found" }),
        headers: {
            "Content-Type": "application/json"
        }
    };
};

app.http('httpTriggerGetUser', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: httpTriggerGetUser
});