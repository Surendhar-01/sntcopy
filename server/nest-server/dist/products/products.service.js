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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const schema_sync_service_1 = require("../database/schema-sync.service");
const utils_1 = require("../common/utils");
let ProductsService = class ProductsService {
    constructor(db, schemaSync) {
        this.db = db;
        this.schemaSync = schemaSync;
    }
    async findAll() {
        return this.db.query('SELECT * FROM products ORDER BY id DESC');
    }
    async create(data) {
        const rows = await this.db.query('INSERT INTO products (code, name, cat, unit, price, stock, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [data.code, data.name, data.cat, data.unit, data.price, data.stock, data.image]);
        await this.schemaSync.syncSchemaSql('create product');
        return { id: rows.insertId };
    }
    async remove(id) {
        await this.db.query('DELETE FROM products WHERE id = ?', [id]);
        await this.schemaSync.syncSchemaSql('delete product');
        return { success: true };
    }
    async updatePrice(id, newPrice, byUser, date) {
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [products] = await connection.query('SELECT name, price FROM products WHERE id = ? LIMIT 1', [id]);
            if (products.length === 0) {
                await connection.rollback();
                return null;
            }
            const product = products[0];
            const oldPrice = Number(product.price || 0);
            await connection.query('UPDATE products SET price = ? WHERE id = ?', [newPrice, id]);
            await connection.query('INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [product.name, oldPrice, newPrice, byUser, (0, utils_1.toMysqlDateTime)(date)]);
            await connection.commit();
            await this.schemaSync.syncSchemaSql('update product price');
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        schema_sync_service_1.SchemaSyncService])
], ProductsService);
//# sourceMappingURL=products.service.js.map