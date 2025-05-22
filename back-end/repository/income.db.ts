import {Income} from '../domain/income';
import {Container, CosmosClient} from '@azure/cosmos';
import { IncomeCategory } from '../types';

interface CosmosDocument {
    title: string;
    id: string;
    userEmail: string;
    amount: number;
    category: IncomeCategory;
    description?: string;
    date?: Date;
}

export class CosmosIncomeRepository {
    private static instance: CosmosIncomeRepository;

    private toIncome(document: CosmosDocument): Income {
        if (!document.id || !document.userEmail || !document.title|| document.amount === undefined || !document.category) {
            throw new Error('Invalid income document.');
        }
        return new Income({
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
            throw new Error('Income Cosmos DB container is required.');
        }
    }

    static async getInstance(): Promise<CosmosIncomeRepository> {
        if (!this.instance) {
            const key = process.env.COSMOS_KEY;
            const endpoint = process.env.COSMOS_ENDPOINT;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = 'income';
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

            this.instance = new CosmosIncomeRepository(container);
        }
        return this.instance;
    }

    async createIncome(income: Income): Promise<Income> {
        const incomeDocument: CosmosDocument = {
            id: income.getId()?.toString() || Date.now().toString(),
            userEmail: income.getUserEmail(),
            amount: income.getAmount(),
            category: income.getCategory(),
            description: income.getDescription(),
            date: income.getDate(),
            title: income.getTitle(),
        };

        const {resource} = await this.container.items.create(incomeDocument);
        return this.toIncome(resource);
    }

    async getIncomeByUserEmail(userEmail: string): Promise<Income[]> {
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.userEmail = @userEmail',
            parameters: [{name: '@userEmail', value: userEmail}],
        };

        const {resources} = await this.container.items.query<CosmosDocument>(querySpec).fetchAll();
        return resources.map(doc => this.toIncome(doc));
    }

    async getIncomeByUserEmailAndCategory(userEmail: string, category: IncomeCategory): Promise<Income[]> {
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.userEmail = @userEmail AND c.category = @category',
            parameters: [
                {name: '@userEmail', value: userEmail},
                {name: '@category', value: category},
            ],
        };

        const {resources} = await this.container.items.query<CosmosDocument>(querySpec).fetchAll();
        return resources.map(doc => this.toIncome(doc));
    }

    async deleteIncome(incomeId: number, userEmail: string): Promise<Income> {
        const incomeUser = this.getIncomeByUserEmail(userEmail);
        const incomeToDelete = (await incomeUser).find(income => income.getId() === incomeId);
        console.log(`incomeToDelete ID: ${incomeToDelete.getId()}`);
        if (!incomeToDelete) {
            throw new Error(`Income with id ${incomeId} not found.`);
        }
        this.container.item(incomeToDelete.getId().toString()).delete();
        return incomeToDelete;
    }

    async updateIncome(income: Income): Promise<Income> {
    const id = income.getId();
    if (!id) {
        throw new Error('Income ID is required for update.');
    }

    const incomeDocument = {
        id: id.toString(),
        userEmail: income.getUserEmail(),
        title: income.getTitle(),
        amount: income.getAmount(),
        category: income.getCategory(),
        description: income.getDescription(),
        date: income.getDate(),
    };

    const { resource } = await this.container
        .item(id.toString(), income.getUserEmail()) // Using userEmail as partition key
        .replace(incomeDocument);

    return this.toIncome(resource);
}
}