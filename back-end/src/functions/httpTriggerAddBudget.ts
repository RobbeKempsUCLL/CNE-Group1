import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BudgetService } from "../../service/budget.service";
import { BudgetInput } from "../../types";
import { CosmosBudgetRepository } from "../../repository/budget.db"; 
import { verifyJwtToken } from "../../util/jwt"; 


export async function httpTriggerAddBudget(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const input = await request.json() as Omit<BudgetInput, 'userEmail'>;

        const budgetInput: BudgetInput = {
            ...input,
            userEmail,
        };

        const budgetService = new BudgetService(await CosmosBudgetRepository.getInstance());
        const budget = await budgetService.createBudget(budgetInput);

        return {
            status: 201,
            jsonBody: budget
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            jsonBody: { error: (error instanceof Error) ? error.message : String(error) }
        };
    }
};

app.http('httpTriggerAddBudget', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: httpTriggerAddBudget
});
