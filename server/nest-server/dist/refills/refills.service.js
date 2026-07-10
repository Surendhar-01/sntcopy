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
exports.RefillsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const schema_sync_service_1 = require("../database/schema-sync.service");
const utils_1 = require("../common/utils");
let RefillsService = class RefillsService {
    constructor(db, schemaSync) {
        this.db = db;
        this.schemaSync = schemaSync;
    }
    async findAll() {
        return this.db.query('SELECT * FROM refills ORDER BY date DESC');
    }
    async create(data) {
        const refillQty = parseInt(data.qty, 10);
        if (!data.product || !Number.isFinite(refillQty) || refillQty <= 0) {
            throw new common_1.HttpException('Product and positive quantity are required', common_1.HttpStatus.BAD_REQUEST);
        }
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [updateResult] = await connection.query('UPDATE products SET stock = stock + ? WHERE name = ?', [refillQty, data.product]);
            if (updateResult.affectedRows === 0) {
                await connection.rollback();
                throw new common_1.HttpException('Product not found for refill', common_1.HttpStatus.NOT_FOUND);
            }
            const [result] = await connection.query('INSERT INTO refills (product, qty, `by`, date, created_at) VALUES (?, ?, ?, ?, NOW())', [data.product, refillQty, data.by || data.by_user || 'system', (0, utils_1.toMysqlDateTime)(data.date)]);
            await connection.commit();
            await this.schemaSync.syncSchemaSql('create refill');
            return { id: result.insertId };
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async remove(id) {
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [rows] = await connection.query('SELECT id, product, qty FROM refills WHERE id = ? LIMIT 1', [id]);
            if (rows.length === 0) {
                await connection.rollback();
                return null;
            }
            const refill = rows[0];
            await connection.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE name = ?', [Number(refill.qty || 0), refill.product]);
            await connection.query('DELETE FROM refills WHERE id = ?', [id]);
            await connection.commit();
            await this.schemaSync.syncSchemaSql('delete refill');
            return { success: true };
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async clearAll() {
        await this.db.query('DELETE FROM refills');
        await this.schemaSync.syncSchemaSql('clear refills');
        return { success: true };
    }
};
exports.RefillsService = RefillsService;
exports.RefillsService = RefillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        schema_sync_service_1.SchemaSyncService])
], RefillsService);
//# sourceMappingURL=refills.service.js.map