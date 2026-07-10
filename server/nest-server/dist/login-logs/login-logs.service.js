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
exports.LoginLogsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const schema_sync_service_1 = require("../database/schema-sync.service");
let LoginLogsService = class LoginLogsService {
    constructor(db, schemaSync) {
        this.db = db;
        this.schemaSync = schemaSync;
    }
    async findAll() {
        return this.db.query("SELECT * FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) <> 'admin' ORDER BY id DESC");
    }
    async create(data) {
        const normalizedRole = String(data.role || '')
            .trim()
            .toLowerCase();
        if (normalizedRole === 'admin') {
            return { skipped: true };
        }
        const [result] = await this.db.query('INSERT INTO login_logs (user, role, loginTime, created_at) VALUES (?, ?, NOW(), NOW())', [
            data.user_name,
            data.role,
        ]);
        await this.schemaSync.syncSchemaSql('create login log');
        return { id: result.insertId };
    }
    async logout(id) {
        if (!Number.isFinite(id)) {
            throw new common_1.HttpException('Valid login log id is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const [result] = await this.db.query("UPDATE login_logs SET logoutTime = NOW(), status = 'Completed' WHERE id = ?", [id]);
        if (result.affectedRows === 0)
            return null;
        await this.schemaSync.syncSchemaSql('update login log logout');
        return { success: true };
    }
    async remove(id) {
        const [result] = await this.db.query('DELETE FROM login_logs WHERE id = ?', [id]);
        if (result.affectedRows === 0)
            return null;
        await this.schemaSync.syncSchemaSql('delete login log');
        return { success: true };
    }
    async clearAll(rolesQuery) {
        const roles = String(rolesQuery || '')
            .split(',')
            .map((role) => role.trim().toLowerCase())
            .filter(Boolean);
        if (roles.length > 0) {
            const placeholders = roles.map(() => '?').join(', ');
            await this.db.query(`DELETE FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) IN (${placeholders})`, roles);
            await this.schemaSync.syncSchemaSql('clear filtered login logs');
        }
        else {
            await this.db.query('DELETE FROM login_logs');
            await this.schemaSync.syncSchemaSql('clear login logs');
        }
        return { success: true };
    }
};
exports.LoginLogsService = LoginLogsService;
exports.LoginLogsService = LoginLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        schema_sync_service_1.SchemaSyncService])
], LoginLogsService);
//# sourceMappingURL=login-logs.service.js.map