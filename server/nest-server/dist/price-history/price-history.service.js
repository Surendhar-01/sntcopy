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
exports.PriceHistoryService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const schema_sync_service_1 = require("../database/schema-sync.service");
let PriceHistoryService = class PriceHistoryService {
    constructor(db, schemaSync) {
        this.db = db;
        this.schemaSync = schemaSync;
    }
    async findAll() {
        return this.db.query('SELECT * FROM price_history ORDER BY date DESC');
    }
    async create(data) {
        const [result] = await this.db.query('INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [data.product, data.old, data.new, data.by || 'system', data.date || new Date()]);
        await this.schemaSync.syncSchemaSql('create price history');
        return { id: result.insertId };
    }
    async remove(id) {
        const [result] = await this.db.query('DELETE FROM price_history WHERE id = ?', [id]);
        if (result.affectedRows === 0)
            return null;
        await this.schemaSync.syncSchemaSql('delete price history');
        return { success: true };
    }
    async clearAll() {
        await this.db.query('DELETE FROM price_history');
        await this.schemaSync.syncSchemaSql('clear price history');
        return { success: true };
    }
};
exports.PriceHistoryService = PriceHistoryService;
exports.PriceHistoryService = PriceHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        schema_sync_service_1.SchemaSyncService])
], PriceHistoryService);
//# sourceMappingURL=price-history.service.js.map