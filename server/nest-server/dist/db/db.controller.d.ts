import { DatabaseService } from '../database/database.service';
export declare class DbController {
    private readonly db;
    constructor(db: DatabaseService);
    info(): {
        name: string;
        status: string;
    };
    getAll(): Promise<{
        products: import("mysql2").QueryResult;
        bills: import("mysql2").QueryResult;
        users: import("mysql2").QueryResult;
        customers: import("mysql2").QueryResult;
        sales: import("mysql2").QueryResult;
        refills: import("mysql2").QueryResult;
        priceHistory: import("mysql2").QueryResult;
        accounts: import("mysql2").QueryResult;
        settings: any;
        loginLogs: import("mysql2").QueryResult;
    }>;
}
