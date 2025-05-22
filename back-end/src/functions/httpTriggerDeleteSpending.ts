import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { SpendingService } from "../../service/spending.service";
import { CosmosSpendingRepository } from "../../repository/spending.db";
import { verifyJwtToken } from "../../util/jwt"; 

export async function httpTriggerDeleteSpending(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return {
            status: 401,
            jsonBody: { error: 'Unauthorized: Missing or invalid Authorization header' }
        };
    }

    let userEmail: string;

    try {
        const token = authHeader.slice(7); // remove "Bearer "
        const decoded = verifyJwtToken(token);
        userEmail = decoded.email;

        if (!userEmail) {
            return {
                status: 401,
                jsonBody: { error: 'Unauthorized: No correct token with email' }
            };
        }
    } catch (err) {
        context.log(`JWT verification error: ${err}`);
        return {
            status: 401,
            jsonBody: { error: 'Unauthorized: Invalid token' }
        };
    }
    try {
        const id = request.query.get('id'); // ?id=123

        if (!id) {
            return {
                status: 400,
                jsonBody: { error: 'Bad Request: Missing id parameter' }
            };
        }

        const spendingService = new SpendingService(await CosmosSpendingRepository.getInstance());
        const spending = await spendingService.deleteSpending(parseInt(id), userEmail);

        return {
            status: 200,
            jsonBody: spending
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            jsonBody: { error: 'Internal Server Error' }
        };
    }
};

app.http('httpTriggerDeleteSpending', {
    methods: ['DELETE',],
    authLevel: 'anonymous',
    handler: httpTriggerDeleteSpending
});
