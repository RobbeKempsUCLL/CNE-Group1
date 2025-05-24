import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { verifyJwtToken } from "../../util/jwt"; 
import { BudgetService } from "../../service/budget.service";
import { CosmosBudgetRepository } from "../../repository/budget.db";

export async function httpTriggerGetBudget(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  // Authenticate
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: Missing or invalid Authorization header" }
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
        jsonBody: { error: "Unauthorized: No correct token with email" }
      };
    }
  } catch (err) {
    context.log(`JWT verification error: ${err}`);
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: Invalid token" }
    };
  }

  // Main logic
  try {
    const monthFilter = request.query.get("month");
    const yearFilter  = request.query.get("year");
    const budgetService = new BudgetService(
      await CosmosBudgetRepository.getInstance()
    );

    // If both month and year are provided, return the single budget
    if (monthFilter && yearFilter) {
      const monthVal = parseInt(monthFilter, 10);
      const yearVal  = parseInt(yearFilter, 10);

      const { budget } = await budgetService.getBudgetByUserEmailAndMonth(
        userEmail,
        monthVal,
        yearVal
      );

      return {
        status: 200,
        jsonBody: {
          id:     budget.getId(),
          budget: budget.getAmount()
        }
      };
    }

    // Otherwise return all budgets for the user
    const { budgets } = await budgetService.getBudgetsByUserEmail(userEmail);
    return {
      status: 200,
      jsonBody: { budgets }
    };

  } catch (error) {
    context.log(`Budget GET error for ${userEmail}: ${error}`);
    // Fallback to an empty single budget
    return {
      status: 200,
      jsonBody: {
        id:     null,
        budget: 0
      }
    };
  }
};

app.http("httpTriggerGetBudget", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: httpTriggerGetBudget
});
