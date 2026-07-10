import { DatabaseService } from '../database/database.service';
import { SchemaSyncService } from '../database/schema-sync.service';
import { MailService } from './mail.service';
export declare class ShiftsService {
    private readonly db;
    private readonly schemaSync;
    private readonly mailService;
    constructor(db: DatabaseService, schemaSync: SchemaSyncService, mailService: MailService);
    startShift(data: any): Promise<{
        success: boolean;
        skipped: boolean;
        shiftStart: string;
        sessionId: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        sessionId: any;
        shiftStart: string;
        skipped?: undefined;
    }>;
    endShift(data: any): Promise<{
        success: boolean;
        message: string;
        emailedTo: string;
        shiftStart: string;
        shiftEnd: string;
        billsCount: number;
        totalItemsSold: number;
        totalSales: any;
        paymentBreakdown: Record<string, number>;
        remainingStockSummary: {
            totalProducts: number;
            healthyCount: number;
            lowStockCount: number;
            outOfStockCount: number;
        };
        promptNextShift: boolean;
    }>;
}
