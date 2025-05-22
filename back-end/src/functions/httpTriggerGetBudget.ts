import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { verifyJwtToken } from "../../util/jwt"; 
import { BudgetService } from "../../service/budget.service";
import { CosmosBudgetRepository } from "../../repository/budget.db";

export async function httpTriggerGetBudget(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        
        const monthFilter = request.query.get('month');
        const yearFilter = request.query.get('year');

        const budgetService = new BudgetService(await CosmosBudgetRepository.getInstance());
        let result;
        if (monthFilter && yearFilter) {
            const month = parseInt(monthFilter);
            const year = parseInt(yearFilter);

            result = await budgetService.getBudgetByUserEmailAndMonth(userEmail, month, year);         
        } else {
            result = await budgetService.getBudgetsByUserEmail(userEmail);
        }
        

        return {
            status: 200,
            jsonBody: result
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            jsonBody: { error: (error instanceof Error) ? error.message : String(error) }
        };
    }
};

app.http('httpTriggerGetBudget', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: httpTriggerGetBudget
});
