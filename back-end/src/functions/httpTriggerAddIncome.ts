import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { IncomeService } from "../../service/income.service";
import { CosmosIncomeRepository } from "../../repository/income.db";
import { IncomeInput } from "../../types";
import { verifyJwtToken } from "../../util/jwt"; 

export async function httpTriggerAddIncome(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const input = await request.json() as Omit<IncomeInput, 'userEmail'>;

        const incomeInput: IncomeInput = {
            ...input,
            userEmail,
        };

        const incomeService = new IncomeService(await CosmosIncomeRepository.getInstance());
        const income = await incomeService.createIncome(incomeInput);

        return {
            status: 201,
            jsonBody: income
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            jsonBody: { error: (error instanceof Error) ? error.message : String(error) }
        };
    }
}

app.http('httpTriggerAddIncome', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: httpTriggerAddIncome
});
