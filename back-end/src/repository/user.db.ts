import { User } from "../domain/user";
import { Container, CosmosClient } from "@azure/cosmos";

interface CosmosDocument {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export class CosmosUserRepository {
    private static instance: CosmosUserRepository;

    private toUser(document: CosmosDocument): User {
        if (!document.id || !document.email || !document.password) {
            throw new Error("Invalid user document.");
        }
        return new User({
            id: parseInt(document.id),
            firstName: document.firstName,
            lastName: document.lastName,
            email: document.email,
            password: document.password,
        });
    }

    constructor(private readonly container: Container) {
        if (!container) {
            throw new Error("User Cosmos DB container is required.");
        }
    }

    static async getInstance(): Promise<CosmosUserRepository> {
        if (!this.instance) {
            const key = process.env.COSMOS_KEY;
            const endpoint = process.env.COSMOS_ENDPOINT;
            const databaseName = process.env.COSMOS_DATABASE_NAME;
            const containerName = "users";
            const partitionKeyPath = ["/partition"];

            if (!key || !endpoint || !databaseName) {
                throw new Error("Azure Cosmos DB Key, Endpoint or Database Name not provided. Exiting...");
            }

            const cosmosClient = new CosmosClient({ endpoint, key });
            const { database } = await cosmosClient.databases.createIfNotExists({ id: databaseName });
            const { container } = await database.containers.createIfNotExists({
                id: containerName,
                partitionKey: {
                    paths: partitionKeyPath,
                },
            });

            this.instance = new CosmosUserRepository(container);
        }
        return this.instance;
    }

    async createUser(user: User): Promise<User> {
        const result = await this.container.items.create({
            id: user.getEmail(),
            firstName: user.getFirstName(),
            lastName: user.getLastName(),
            email: user.getEmail(),
            password: user.getPassword(),
            partition: user.getEmail().substring(0, 3),
        });

        if (result && result.statusCode >= 200 && result.statusCode < 400) {
            return user;
        } else {
            throw new Error("Could not create user.");
        }
    }

    async userExists(email: string): Promise<boolean> {
        const { resource } = await this.container.item(email, email.substring(0, 3)).read();
        return !!resource;
    }
    

    async getUser(email: string): Promise<User> {
        const { resource } = await this.container.item(email).read();
        try{
            if (resource) {
                return this.toUser(resource);
            } else {
                throw new Error("User not found.");
            }
        } catch (error) {
            console.error("Error in getUser:", error);
            throw new Error("Error retrieving user from database.");
        }
       
    }
}