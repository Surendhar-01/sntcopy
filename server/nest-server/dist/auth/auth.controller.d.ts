import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        user: string;
        password: string;
    }): Promise<{
        user: string;
        role: string;
    }>;
}
