import { DatabaseService } from '../database.service';
export declare class AuthService {
    private readonly db;
    constructor(db: DatabaseService);
    login(username?: string, password?: string): Promise<{
        user: any;
        role: any;
    }>;
}
