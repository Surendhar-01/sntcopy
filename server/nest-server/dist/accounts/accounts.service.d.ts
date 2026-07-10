import { DatabaseService } from '../database/database.service';
import { SchemaSyncService } from '../database/schema-sync.service';
export declare class AccountsService {
    private readonly db;
    private readonly schemaSync;
    constructor(db: DatabaseService, schemaSync: SchemaSyncService);
    findAll(): Promise<any>;
    create(data: any): Promise<{
        id: any;
    }>;
    updatePassword(username: string, nextPassword: string): Promise<{
        success: boolean;
    }>;
    remove(username: string): Promise<{
        success: boolean;
    }>;
}
