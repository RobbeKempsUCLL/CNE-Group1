import {Container, CosmosClient} from '@azure/cosmos';
import { Budget } from '../domain/budget';

interface CosmosDocument {
    id: string;
    userEmail: string;
    amount: number;
    description?: string;
    createdAt?: string;
    year?: number;
    monthInt?: number;
}

export class CosmosBudgetRepository {
    private static instance: CosmosBudgetRepository;

    private toBudget(document: CosmosDocument): Budget {
        if (!document.id || !document.userEmail || document.amount === undefined) {
            throw new Error('Invalid budget document.');
        }
        return new Budget({
            id: parseInt(document.id),
            userEmail: document.userEmail,
            amount: document.amount,
            description: document.description,
            createdAt: document.createdAt ? new Date(document.createdAt) : new Date(),
        });
    }
    constructor(private readonly container: Container) {
        if (!container) {
            throw new Error('Budget Cosmos DB container is required.');
        }
    }

    static async getInstance(): Promise<CosmosBudgetRepository> {
        if (!this.instance) {
            const key = process.env.COSMOS_KEY;
            const endpoint = process.env.COSMOS_ENDPOINT;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = 'budgets';
            const partitionKeyPath = ['/partition'];

            if (!key || !endpoint || !databaseName) {
                throw new Error('Azure Cosmos DB Key, Endpoint or Database Name not provided. Exiting...');
            }

            const cosmosClient = new CosmosClient({endpoint, key});
            const {database} = await cosmosClient.databases.createIfNotExists({id: databaseName});
            const {container} = await database.containers.createIfNotExists({
                id: containerName,
                partitionKey: {
                    paths: partitionKeyPath,
                },
            });

            this.instance = new CosmosBudgetRepository(container);
        }
        return this.instance;
    }

    async createBudget(budget: Budget): Promise<Budget> {
        const userEmail = budget.getUserEmail();
        const createdAt = budget.getCreatedAt();  // Use createdAt date
        const year = createdAt.getFullYear();
        const month = createdAt.getMonth() + 1; // getMonth() is zero-based, +1 to match 1-based month

        // Query for existing budget for same user, month, and year
        const query = {
            query: `
                SELECT * FROM c
                WHERE c.userEmail = @userEmail
                  AND c.year = @year
                  AND c.monthInt = @monthInt
            `,
            parameters: [
                { name: '@userEmail', value: userEmail },
                { name: '@year', value: year },
                { name: '@monthInt', value: month },
            ],
        };

        const { resources: existing } = await this.container.items.query(query).fetchAll();

        if (existing.length > 0) {
            throw new Error(`Budget already exists for ${month}/${year}`);
        }

        // Proceed with creation
        const document: CosmosDocument = {
            id: budget.getId()?.toString() || Date.now().toString(),
            userEmail,
            amount: budget.getAmount(),
            description: budget.getDescription(),
            createdAt: createdAt.toISOString(),

            // Add year and monthInt explicitly to the document
            year: year,
            monthInt: month,
        };

        const { resource } = await this.container.items.create(document);
        return this.toBudget(resource);
    }


    async getBudgetsByUserEmail(userEmail: string): Promise<Budget[]> {
        const query = {
            query: 'SELECT * FROM c WHERE c.userEmail = @userEmail',
            parameters: [{ name: '@userEmail', value: userEmail }],
        };

        const { resources } = await this.container.items.query<CosmosDocument>(query).fetchAll();
        return resources.map(doc => this.toBudget(doc));
    }

    async getBudgetByUserEmailAndMonth(userEmail: string, month: number, year: number): Promise<Budget | null> {
        console.log(`[budgetDB] getBudgetByUserEmailAndMonth called with`, { userEmail, month, year });
        const query = {
            query: `
                SELECT * FROM c 
                WHERE c.userEmail = @userEmail 
                  AND c.year = @year 
                  AND c.monthInt = @monthInt
            `,
            parameters: [
                { name: '@userEmail', value: userEmail },
                { name: '@year', value: year },
                { name: '@monthInt', value: month },
            ],
        };

        const { resources } = await this.container.items.query<CosmosDocument>(query).fetchAll();
        if (!resources.length) return null;

        return this.toBudget(resources[0]);
    }

    async updateBudgetAmount(id: number, userEmail: string, newAmount: number): Promise<Budget> {
        const budgetsUser = await this.getBudgetsByUserEmail(userEmail);
        console.log(`[budgetDB] budgetsUser`, budgetsUser);
        const budgetToChange = budgetsUser.find(b => b.getId() === id);
        if (!budgetToChange) {
            throw new Error(`Budget with id ${id} not found.`);
        }
        budgetToChange.setAmount(newAmount);
        const updatedDocument: CosmosDocument = {
            id: budgetToChange.getId()?.toString() || '',
            userEmail: budgetToChange.getUserEmail(),
            amount: budgetToChange.getAmount(),
            description: budgetToChange.getDescription(),
            createdAt: budgetToChange.getCreatedAt().toISOString(),
        };
        await this.container.item(updatedDocument.id).replace(updatedDocument);
        return budgetToChange;
    }

    async deleteBudget(id: number, userEmail: string): Promise<Budget> {
        const budgetsUser = await this.getBudgetsByUserEmail(userEmail);
        const budgetToDelete = budgetsUser.find(b => b.getId() === id);
        if (!budgetToDelete) {
            throw new Error(`Budget with id ${id} not found.`);
        }
        await this.container.item(budgetToDelete.getId().toString()).delete();
        return budgetToDelete;
    }





}