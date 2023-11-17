import { Db } from 'mongodb';

export interface IRepository {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getDb(dbName: string): Db;
}