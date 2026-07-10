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
exports.BillsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const schema_sync_service_1 = require("../database/schema-sync.service");
const utils_1 = require("../common/utils");
let BillsService = class BillsService {
    constructor(db, schemaSync) {
        this.db = db;
        this.schemaSync = schemaSync;
    }
    async findAll() {
        return this.db.query('SELECT * FROM bills ORDER BY date DESC');
    }
    async create(data) {
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const saleDate = (0, utils_1.toMysqlDateTime)(data.date);
            let billNoToUse = String(data.billNo || '').trim();
            if (!billNoToUse) {
                billNoToUse = await this.getNextBillNo(connection);
            }
            else {
                const [existing] = await connection.query('SELECT id FROM bills WHERE billNo = ? LIMIT 1', [billNoToUse]);
                if (existing.length > 0) {
                    billNoToUse = await this.getNextBillNo(connection);
                }
            }
            const [result] = await connection.query('INSERT INTO bills (billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, items, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())', [billNoToUse, data.customer, data.phone, data.payment, saleDate, data.subtotal, data.cgst, data.sgst, data.grand, JSON.stringify(data.items || []), data.by_user]);
            if (Array.isArray(data.items)) {
                for (const item of data.items) {
                    await connection.query('UPDATE products SET stock = GREATEST(0, stock - ?), sold = sold + ? WHERE id = ?', [item.qty, item.qty, item.id]);
                    await connection.query('INSERT INTO sales (date, billNo, customer, product, qty, amount, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [saleDate, billNoToUse, data.customer || null, item.name, item.qty, item.total || (item.qty * item.price), data.by_user || null]);
                }
            }
            if (data.customer) {
                await connection.query('INSERT INTO customers (`name`, `phone`, `visits`, `total`, `firstVisit`, `lastVisit`) VALUES (?, ?, 1, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `visits` = `visits` + 1, `total` = `total` + VALUES(`total`), `firstVisit` = IFNULL(LEAST(`firstVisit`, VALUES(`firstVisit`)), VALUES(`firstVisit`)), `lastVisit` = IFNULL(GREATEST(`lastVisit`, VALUES(`lastVisit`)), VALUES(`lastVisit`))', [data.customer, data.phone || null, data.grand || 0, saleDate, saleDate]);
            }
            await connection.commit();
            await this.schemaSync.syncSchemaSql('create bill');
            return { id: result.insertId, billNo: billNoToUse };
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
            const [bills] = await connection.query('SELECT * FROM bills WHERE id = ?', [id]);
            if (bills.length === 0) {
                await connection.rollback();
                return null;
            }
            const bill = bills[0];
            const items = typeof bill.items === 'string' ? JSON.parse(bill.items) : bill.items;
            if (Array.isArray(items)) {
                for (const item of items) {
                    await connection.query('UPDATE products SET stock = stock + ?, sold = GREATEST(0, sold - ?) WHERE id = ?', [item.qty, item.qty, item.id]);
                }
            }
            await connection.query('DELETE FROM bills WHERE id = ?', [id]);
            await connection.query('DELETE FROM sales WHERE billNo = ?', [bill.billNo]);
            await connection.commit();
            await this.schemaSync.syncSchemaSql('delete bill');
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
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [bills] = await connection.query('SELECT items FROM bills');
            const rollbackByProductId = new Map();
            for (const bill of bills) {
                const parsedItems = typeof bill.items === 'string' ? JSON.parse(bill.items || '[]') : (bill.items || []);
                if (!Array.isArray(parsedItems))
                    continue;
                for (const item of parsedItems) {
                    const productId = Number(item.id);
                    const qty = Number(item.qty || 0);
                    if (!Number.isFinite(productId) || !Number.isFinite(qty) || qty <= 0)
                        continue;
                    rollbackByProductId.set(productId, (rollbackByProductId.get(productId) || 0) + qty);
                }
            }
            for (const [productId, qty] of rollbackByProductId.entries()) {
                await connection.query('UPDATE products SET stock = stock + ?, sold = GREATEST(0, sold - ?) WHERE id = ?', [qty, qty, productId]);
            }
            await connection.query('DELETE FROM bills');
            await connection.query('DELETE FROM customers');
            await connection.query('DELETE FROM sales');
            await connection.commit();
            await this.schemaSync.syncSchemaSql('clear bills');
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
    async getNextBillNo(connection) {
        const [rows] = await connection.query("SELECT billNo FROM bills WHERE billNo LIKE 'SNT-%' ORDER BY CAST(SUBSTRING_INDEX(billNo, '-', -1) AS UNSIGNED) DESC LIMIT 1");
        const current = rows?.[0]?.billNo || '';
        const match = String(current).match(/SNT-(\d+)/i);
        const seq = match ? Number(match[1]) + 1 : 1000;
        return `SNT-${String(seq).padStart(4, '0')}`;
    }
};
exports.BillsService = BillsService;
exports.BillsService = BillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        schema_sync_service_1.SchemaSyncService])
], BillsService);
//# sourceMappingURL=bills.service.js.map