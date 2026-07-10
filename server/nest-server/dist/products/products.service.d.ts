import { DatabaseService } from '../database/database.service';
import { SchemaSyncService } from '../database/schema-sync.service';
export declare class ProductsService {
    private readonly db;
    private readonly schemaSync;
    constructor(db: DatabaseService, schemaSync: SchemaSyncService);
    findAll(): Promise<any>;
    create(data: any): Promise<{
        id: any;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    updatePrice(id: number, newPrice: number, byUser: string, date?: string): Promise<{
        success: boolean;
    }>;
}
