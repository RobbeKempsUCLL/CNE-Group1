import {Spending} from '../domain/spending';
import {Container, CosmosClient} from '@azure/cosmos';
import { SpendingCategory } from '../types';

interface CosmosDocument {
    title: string;
    id: string;
    userEmail: string;
    amount: number;
    category: SpendingCategory;
    description?: string;
    date?: Date;
}

export class CosmosSpendingRepository {
    private static instance: CosmosSpendingRepository;

    private toSpending(document: CosmosDocument): Spending {
        if (!document.id || !document.userEmail || !document.title|| document.amount === undefined || !document.category) {
            throw new Error('Invalid spending document.');
        }
        return new Spending({
            id: parseInt(document.id),
            userEmail: document.userEmail,
            title: document.title, 
            amount: document.amount,
            category: document.category,
            description: document.description,
            date: document.date ? new Date(document.date) : new Date(),
        });
    }

    constructor(private readonly container: Container) {
        if (!container) {
            throw new Error('Spending Cosmos DB container is required.');
        }
    }

    static async getInstance(): Promise<CosmosSpendingRepository> {
        if (!this.instance) {
            const key = process.env.COSMOS_KEY;
            const endpoint = process.env.COSMOS_ENDPOINT;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = 'spendings';
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

            this.instance = new CosmosSpendingRepository(container);
        }
        return this.instance;
    }

    async createSpending(spending: Spending): Promise<Spending> {
        const spendingDocument: CosmosDocument = {
            id: spending.getId()?.toString() || Date.now().toString(),
            userEmail: spending.getUserEmail(),
            amount: spending.getAmount(),
            category: spending.getCategory(),
            description: spending.getDescription(),
            date: spending.getDate(),
            title: spending.getTitle(),
        };

        const {resource} = await this.container.items.create(spendingDocument);
        return this.toSpending(resource);
    }

    async getSpendingsByUserEmail(userEmail: string): Promise<Spending[]> {
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.userEmail = @userEmail',
            parameters: [{name: '@userEmail', value: userEmail}],
        };

        const {resources} = await this.container.items.query<CosmosDocument>(querySpec).fetchAll();
        return resources.map(doc => this.toSpending(doc));
    }

    async getSpendingsByUserEmailAndCategory(userEmail: string, category: SpendingCategory): Promise<Spending[]> {
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.userEmail = @userEmail AND c.category = @category',
            parameters: [
                {name: '@userEmail', value: userEmail},
                {name: '@category', value: category},
            ],
        };

        const {resources} = await this.container.items.query<CosmosDocument>(querySpec).fetchAll();
        return resources.map(doc => this.toSpending(doc));
    }

    async getSpendingsByUserEmailAndMonth(userEmail: string, year: number, month: number): Promise<Spending[]> {
        const paddedMonth = month.toString().padStart(2, '0'); // ensures "05" format for May
        
        const querySpec = {
            query: `
                SELECT * FROM c 
                WHERE c.userEmail = @userEmail 
                  AND STARTSWITH(c.date, @yearMonth)
            `,
            parameters: [
                { name: '@userEmail', value: userEmail },
                { name: '@yearMonth', value: `${year}-${paddedMonth}` }, // e.g., "2025-05"
            ],
        };
    
        const { resources } = await this.container.items.query<CosmosDocument>(querySpec).fetchAll();
        return resources.map(doc => this.toSpending(doc));
    }

    async deleteSpending(spendingId: number, userEmail: string): Promise<Spending> {
        //const spendingDocumentId = spendingId.toString();
        const spendingsUser = this.getSpendingsByUserEmail(userEmail);
        const spendingToDelete = (await spendingsUser).find(spending => spending.getId() === spendingId);
        if (!spendingToDelete) {
            throw new Error(`Spending with id ${spendingId} not found.`);
        }
        this.container.item(spendingToDelete.getId().toString()).delete();
        return spendingToDelete;
    }
}