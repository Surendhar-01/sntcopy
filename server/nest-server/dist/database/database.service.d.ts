import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private pool;
    get dbName(): string;
    private get dbPort();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getPool(): mysql.Pool;
    query(sql: string, params?: any[]): Promise<any>;
    getConnection(): Promise<mysql.PoolConnection>;
    private initializeDatabase;
    private migrateLegacyAccountPasswords;
}
