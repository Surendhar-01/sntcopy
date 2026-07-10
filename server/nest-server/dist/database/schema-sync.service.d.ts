import { DatabaseService } from './database.service';
export declare class SchemaSyncService {
    private readonly db;
    private schemaExportPromise;
    private readonly schemaExportTableOrder;
    constructor(db: DatabaseService);
    private get schemaSqlPath();
    syncSchemaSql(reason: string): Promise<void>;
    private escapeSqlValue;
    private normalizeAccountRowForExport;
    private normalizeRow;
    private buildInserts;
    private writeSnapshot;
}
