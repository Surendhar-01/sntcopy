import type { Pool } from 'mysql2/promise';
export declare class DatabaseService {
    private readonly pool;
    constructor(pool: Pool);
    query(sql: string, values?: any[]): Promise<any>;
    getConnection(): Promise<import("mysql2/promise").PoolConnection>;
}
