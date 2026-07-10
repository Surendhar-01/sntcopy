import { LoginLogsService } from './login-logs.service';
export declare class LoginLogsController {
    private readonly loginLogsService;
    constructor(loginLogsService: LoginLogsService);
    findAll(): Promise<any>;
    create(body: any): Promise<{
        skipped: boolean;
        id?: undefined;
    } | {
        id: any;
        skipped?: undefined;
    }>;
    logout(id: string): Promise<{
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    clearAll(roles: string): Promise<{
        success: boolean;
    }>;
}
