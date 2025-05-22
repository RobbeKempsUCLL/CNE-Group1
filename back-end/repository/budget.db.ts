import {Container, CosmosClient} from '@azure/cosmos';
import { Budget } from '../domain/budget';

interface CosmosDocument {
    id: string;
    userEmail: string;
    amount: number;
    month: Date;
    year: number;
    description?: string;
    createdAt?: Date;
}

export class CosmosBudgetRepository {
    private static instance: CosmosBudgetRepository;

    private toBudget(document: CosmosDocument): Budget {
        if (!document.id || !document.userEmail || document.amount === undefined || !document.month) {
            throw new Error('Invalid budget document.');
        }
        const monthDate = new Date(document.month);
        return new Budget({
            id: parseInt(document.id),
            userEmail: document.userEmail,
            amount: document.amount,
            month: monthDate.getMonth(), // convert Date to 1-based month
        year: monthDate.getFullYear(),
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
        const monthDate = budget.getMonth();
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth(); // 1-based

        // Query for existing budget for same user, month, and year
        const query = {
            query: `
                SELECT * FROM c
                WHERE c.userEmail = @userEmail
                  AND c.year = @year
            `,
            parameters: [
                { name: '@userEmail', value: userEmail },
                { name: '@year', value: year },
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
            month: budget.getMonth(),
            year,
            description: budget.getDescription(),
            createdAt: budget.getCreatedAt(),
        };

        const { resource } = await this.container.items.create(document);
        return this.toBudget(resource);
    }

}