import { BillsService } from './bills.service';
export declare class BillsController {
    private readonly billsService;
    constructor(billsService: BillsService);
    findAll(): Promise<any>;
    create(body: any): Promise<{
        id: any;
        billNo: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    clearAll(): Promise<{
        success: boolean;
    }>;
}
