import { AccountsService } from './accounts.service';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    findAll(): Promise<any>;
    create(body: any): Promise<{
        id: any;
    }>;
    updatePassword(user: string, body: any): Promise<{
        success: boolean;
    }>;
    remove(user: string): Promise<{
        success: boolean;
    }>;
}
