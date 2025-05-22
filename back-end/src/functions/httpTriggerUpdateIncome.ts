import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { IncomeService } from "../../service/income.service";
import { CosmosIncomeRepository } from "../../repository/income.db";
import { IncomeInput } from "../../types";
import { verifyJwtToken } from "../../util/jwt";

export async function httpTriggerUpdateIncome(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
                jsonBody: { error: 'Unauthorized: Token does not contain a valid email' }
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

        if (!input.id) {
            return {
                status: 400,
                jsonBody: { error: 'Income ID is required to update.' }
            };
        }

        const incomeInput: IncomeInput = {
            ...input,
            userEmail,
        };

        const incomeService = new IncomeService(await CosmosIncomeRepository.getInstance());
        const updatedIncome = await incomeService.updateIncome(incomeInput);

        return {
            status: 200,
            jsonBody: updatedIncome
        };
    } catch (error) {
        context.log(`Error updating income: ${error}`);
        return {
            status: 500,
            jsonBody: { error: 'Internal Server Error' }
        };
    }
}

app.http('httpTriggerUpdateIncome', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: httpTriggerUpdateIncome
});
