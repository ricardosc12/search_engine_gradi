import { MongoClient, Db } from 'mongodb';
import { IRepository } from './interface';

export class RepositoryController implements IRepository {
    
    private client: MongoClient;

    constructor(private uri: string) {
        this.client = new MongoClient(uri);
    }

    async connect(): Promise<void> {
        await this.client.connect();
        console.log('Connected to MongoDB');
    }

    async disconnect(): Promise<void> {
        await this.client.close();
        console.log('Disconnected from MongoDB');
    }

    getDb(dbName: string): Db {
        return this.client.db(dbName);
    }
}