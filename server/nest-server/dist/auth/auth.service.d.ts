import { DatabaseService } from '../database/database.service';
export declare class AuthService {
    private readonly db;
    constructor(db: DatabaseService);
    login(user: string, password: string): Promise<{
        user: string;
        role: string;
    } | null>;
}
