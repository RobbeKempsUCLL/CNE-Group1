import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { IncomeService } from "../../service/income.service";
import { CosmosIncomeRepository } from "../../repository/income.db";
import { verifyJwtToken } from "../../util/jwt"; 
import { IncomeCategory } from "../../types";

export async function httpTriggerGetIncome(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const token = authHeader.slice(7); 
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
        const categoryFilter = request.query.get('category') as IncomeCategory; 

        const incomeService = new IncomeService(await CosmosIncomeRepository.getInstance());
        let result;
        if (categoryFilter) {
            result = await incomeService.getIncomeByUserEmailAndCategory(userEmail, categoryFilter);
            
        }
        else {
            result = await incomeService.getIncomeByUserEmail(userEmail);
        }

        return {
            status: 200,
            jsonBody: result
        };
    } catch (error) {
        context.log({error});
        return {
            status: 500,
            jsonBody: { error: 'Internal Server Error' }
        };
    }
};

console.log("Registering httpTriggerGetIncome")

app.http('httpTriggerGetIncome', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: httpTriggerGetIncome
});
