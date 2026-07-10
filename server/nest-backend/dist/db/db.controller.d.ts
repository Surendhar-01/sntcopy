import { DbService } from './db.service';
export declare class DbController {
    private readonly dbService;
    constructor(dbService: DbService);
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
