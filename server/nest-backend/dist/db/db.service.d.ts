import { DatabaseService } from '../database.service';
export declare class DbService {
    private readonly db;
    constructor(db: DatabaseService);
    getAllData(): Promise<{
        products: any;
        bills: any;
        users: any;
        customers: any;
        sales: any;
        refills: any;
        priceHistory: any;
        accounts: any;
        settings: any;
        loginLogs: any;
    }>;
}
