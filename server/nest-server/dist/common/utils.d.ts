export declare function toMysqlDateTime(value?: string | Date): string;
export declare function formatCurrency(value: number | string): string;
export declare function escapeHtml(value: any): string;
export declare function parseItems(rawItems: any): any[];
export declare function isHashedPassword(storedPassword: string): boolean;
export declare function hashPassword(password: string): string;
export declare function verifyPassword(password: string, storedPassword: string): boolean;
export declare function buildCsv(headers: string[], rows: any[][]): string;
export declare function getPaymentBreakdown(bills: any[]): Record<string, number>;
export declare function getRemainingStockSummary(productRows: any[], soldByProductId: Map<number, number>, refillByProductName: Map<string, number>): {
    totals: {
        totalProducts: number;
        healthyCount: number;
        lowStockCount: number;
        outOfStockCount: number;
    };
    products: {
        id: number;
        name: any;
        category: any;
        unit: any;
        price: number;
        estimatedOpeningStock: number;
        soldInShift: number;
        refilledInShift: number;
        currentStock: number;
        status: string;
    }[];
};
