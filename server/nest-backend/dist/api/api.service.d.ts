import { DatabaseService } from '../database.service';
export declare class ApiService {
    private readonly db;
    constructor(db: DatabaseService);
    getNextBillNo(connection: any): Promise<string>;
    createBill(body: any): Promise<{
        id: any;
        billNo: string;
    }>;
    deleteBill(id: number): Promise<{
        success: boolean;
    }>;
    clearBills(): Promise<{
        success: boolean;
    }>;
    createRefill(body: any): Promise<{
        id: any;
    }>;
    deleteRefill(id: number): Promise<{
        success: boolean;
    }>;
    clearRefills(): Promise<{
        success: boolean;
    }>;
    syncOpeningStock(): Promise<{
        success: boolean;
    }>;
    repairStock(): Promise<{
        success: boolean;
        repairedProducts: number;
        invalidProducts: any[];
        duplicateBills: any[];
        duplicateRefills: any[];
    }>;
    createPriceHistory(body: any): Promise<{
        id: any;
    }>;
    deletePriceHistory(id: number): Promise<{
        success: boolean;
    }>;
    clearPriceHistory(): Promise<{
        success: boolean;
    }>;
    updateProductPrice(id: number, body: any): Promise<{
        success: boolean;
    }>;
    createProduct(body: any): Promise<{
        id: any;
    }>;
    deleteProduct(id: number): Promise<{
        success: boolean;
    }>;
    createAccount(body: any): Promise<{
        id: any;
    }>;
    updateAccountPassword(username: string, body: any): Promise<{
        success: boolean;
    }>;
    deleteAccount(username: string): Promise<{
        success: boolean;
    }>;
    clearCustomers(): Promise<{
        success: boolean;
    }>;
    resetSalesData(): Promise<{
        success: boolean;
        backupId: any;
        message: string;
    }>;
    createLoginLog(body: any): Promise<{
        skipped: boolean;
        id?: undefined;
    } | {
        id: any;
        skipped?: undefined;
    }>;
    logout(id: number): Promise<{
        success: boolean;
    }>;
    deleteLoginLog(id: number): Promise<{
        success: boolean;
    }>;
    clearLoginLogs(): Promise<{
        success: boolean;
    }>;
    updateSettings(body: any): Promise<{
        success: boolean;
    }>;
    getActiveShift(user: string, role: string): Promise<{
        success: boolean;
        shiftStart: string;
        sessionId: any;
        active: boolean;
    } | {
        success: boolean;
        shiftStart: null;
        sessionId: null;
        active: boolean;
    }>;
    startShift(body: any): Promise<{
        success: boolean;
        skipped: boolean;
        shiftStart: string;
        sessionId: null;
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
        emailedTo: string | null;
        shiftStart: string;
        shiftEnd: string;
        billsCount: number;
        totalItemsSold: number;
        totalSales: any;
        paymentBreakdown: any;
        remainingStockSummary: {
            totalProducts: number;
            healthyCount: number;
            lowStockCount: number;
            outOfStockCount: number;
        };
        promptNextShift: boolean;
    }>;
    getSettings(): Promise<unknown>;
    getProducts(): Promise<unknown>;
    getBills(): Promise<unknown>;
    getCustomers(): Promise<unknown>;
    getRefills(): Promise<unknown>;
    getPriceHistory(): Promise<unknown>;
    getLoginLogs(): Promise<unknown>;
    getAccounts(): Promise<unknown>;
}
