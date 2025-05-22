import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { verifyJwtToken } from "../../util/jwt";
import { BudgetService } from "../../service/budget.service";
import { CosmosBudgetRepository } from "../../repository/budget.db";

export async function httpTriggerUpdateBudget(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

        const body = await request.json() as { amount: number };

        if (typeof body.amount !== "number") {
            return {
                status: 400,
                jsonBody: { error: "Bad Request: Missing or invalid 'amount' in body" },
            };
        }

        const budgetService = new BudgetService(await CosmosBudgetRepository.getInstance());
        const updatedBudget = await budgetService.updateBudget(parseInt(id), userEmail, body.amount);

        return {
            status: 200,
            jsonBody: updatedBudget,
        };

    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            jsonBody: { error: (error instanceof Error) ? error.message : String(error) }
        };
    }
};

app.http('httpTriggerUpdateBudget', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: httpTriggerUpdateBudget
});
