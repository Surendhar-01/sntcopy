"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database.service");
const utils_1 = require("../utils");
let AuthService = class AuthService {
    db;
    constructor(db) {
        this.db = db;
    }
    async login(username, password) {
        if (!username || !password) {
            throw new common_1.BadRequestException('Username and password are required');
        }
        const [rows] = await this.db.query('SELECT id, user, pass, role FROM accounts WHERE LOWER(TRIM(user)) = LOWER(TRIM(?)) LIMIT 1', [username]);
        if (!rows.length) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const account = rows[0];
        if (!(0, utils_1.verifyPassword)(password, account.pass)) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!account.pass.startsWith('scrypt$')) {
            const updatedHash = (0, utils_1.hashPassword)(password);
            await this.db.query('UPDATE accounts SET pass = ? WHERE id = ?', [
                updatedHash,
                account.id,
            ]);
        }
        return { user: account.user, role: account.role };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map