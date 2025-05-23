import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { SpendingService } from "../../service/spending.service";
import { CosmosSpendingRepository } from "../../repository/spending.db";
import { BudgetService } from "../../service/budget.service";
import { verifyJwtToken } from "../../util/jwt"; 
import { SpendingCategory } from "../../types";

export async function httpTriggerGetSpendings(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const categoryFilter = request.query.get('category') as SpendingCategory | null;
        const monthFilter = request.query.get('month');
        const yearFilter = request.query.get('year');
        const { CosmosBudgetRepository } = await import("../../repository/budget.db");
        const spendingService = new SpendingService(
            await CosmosSpendingRepository.getInstance(),
            new BudgetService(await CosmosBudgetRepository.getInstance())
        );
        let result;

        if (monthFilter && yearFilter) {
            const month = parseInt(monthFilter);
            const year = parseInt(yearFilter);
            result = await spendingService.getSpendingByUserEmailAndMonth(userEmail, month, year);
        } else if (categoryFilter) {
            result = await spendingService.getSpendingsByUserEmailAndCategory(userEmail, categoryFilter);
        } else {
            result = await spendingService.getSpendingsByUserEmail(userEmail);
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

app.http('httpTriggerGetSpendings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: httpTriggerGetSpendings
});
