import { PriceHistoryService } from './price-history.service';
export declare class PriceHistoryController {
    private readonly priceHistoryService;
    constructor(priceHistoryService: PriceHistoryService);
    findAll(): Promise<any>;
    create(body: any): Promise<{
        id: any;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    clearAll(): Promise<{
        success: boolean;
    }>;
}
