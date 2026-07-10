import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(): Promise<any>;
    create(body: any): Promise<{
        id: any;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    updatePrice(id: string, body: any): Promise<{
        success: boolean;
    }>;
}
