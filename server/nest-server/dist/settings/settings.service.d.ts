import { DatabaseService } from '../database/database.service';
import { SchemaSyncService } from '../database/schema-sync.service';
export declare class SettingsService {
    private readonly db;
    private readonly schemaSync;
    constructor(db: DatabaseService, schemaSync: SchemaSyncService);
    findOne(): Promise<any>;
    update(data: any): Promise<{
        success: boolean;
        id: any;
        settings: {
            gst: any;
            shop: any;
            addr: any;
            gstin: any;
            fssai: any;
            phone: any;
        };
    }>;
    private mapSettings;
}
