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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const schema_sync_service_1 = require("../database/schema-sync.service");
const utils_1 = require("../common/utils");
let AccountsService = class AccountsService {
    constructor(db, schemaSync) {
        this.db = db;
        this.schemaSync = schemaSync;
    }
    async findAll() {
        return this.db.query('SELECT id, user, role FROM accounts ORDER BY id ASC');
    }
    async create(data) {
        const hashedPassword = (0, utils_1.hashPassword)(data.password || '');
        const [result] = await this.db.query('INSERT INTO accounts (user, pass, role, created_at) VALUES (?, ?, ?, NOW())', [data.user, hashedPassword, data.role || 'Staff']);
        await this.schemaSync.syncSchemaSql('create account');
        return { id: result.insertId };
    }
    async updatePassword(username, nextPassword) {
        const hashedPassword = (0, utils_1.hashPassword)(nextPassword);
        const [result] = await this.db.query('UPDATE accounts SET pass = ? WHERE user = ?', [hashedPassword, username]);
        if (result.affectedRows === 0)
            return null;
        await this.schemaSync.syncSchemaSql('update account password');
        return { success: true };
    }
    async remove(username) {
        await this.db.query('DELETE FROM accounts WHERE user = ?', [username]);
        await this.schemaSync.syncSchemaSql('delete account');
        return { success: true };
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        schema_sync_service_1.SchemaSyncService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map