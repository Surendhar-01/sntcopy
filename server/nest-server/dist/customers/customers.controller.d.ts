import { DatabaseService } from '../database/database.service';
import { SchemaSyncService } from '../database/schema-sync.service';
export declare class CustomersController {
    private readonly db;
    private readonly schemaSync;
    constructor(db: DatabaseService, schemaSync: SchemaSyncService);
    findAll(): Promise<any>;
    clearAll(): Promise<{
        success: boolean;
    }>;
}
