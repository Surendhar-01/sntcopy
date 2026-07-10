import { RefillsService } from './refills.service';
export declare class RefillsController {
    private readonly refillsService;
    constructor(refillsService: RefillsService);
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
