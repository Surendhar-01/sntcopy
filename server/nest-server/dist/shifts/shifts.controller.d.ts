import { ShiftsService } from './shifts.service';
export declare class ShiftsController {
    private readonly shiftsService;
    constructor(shiftsService: ShiftsService);
    startShift(body: any): Promise<{
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
    endShift(body: any): Promise<{
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
