import { DatabaseService } from '../database/database.service';
import { SchemaSyncService } from '../database/schema-sync.service';
export declare class LoginLogsService {
    private readonly db;
    private readonly schemaSync;
    constructor(db: DatabaseService, schemaSync: SchemaSyncService);
    findAll(): Promise<any>;
    create(data: any): Promise<{
        skipped: boolean;
        id?: undefined;
    } | {
        id: any;
        skipped?: undefined;
    }>;
    logout(id: number): Promise<{
        success: boolean;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    clearAll(rolesQuery?: string): Promise<{
        success: boolean;
    }>;
}
