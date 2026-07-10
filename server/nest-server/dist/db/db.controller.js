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
exports.DbController = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let DbController = class DbController {
    constructor(db) {
        this.db = db;
    }
    info() {
        return { name: 'Sri Nikil ERP API', status: 'ok' };
    }
    async getAll() {
        const connection = await this.db.getConnection();
        try {
            const [products, bills, users, customers, sales, refills, priceHistory, accounts, settings, loginLogs] = await Promise.all([
                connection.query('SELECT * FROM products ORDER BY id DESC'),
                connection.query('SELECT * FROM bills ORDER BY date DESC'),
                connection.query('SELECT * FROM users'),
                connection.query('SELECT * FROM customers ORDER BY id DESC'),
                connection.query('SELECT * FROM sales ORDER BY date DESC'),
                connection.query('SELECT * FROM refills ORDER BY date DESC'),
                connection.query('SELECT * FROM price_history ORDER BY date DESC'),
                connection.query('SELECT id, user, role FROM accounts ORDER BY id ASC'),
                connection.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1'),
                connection.query("SELECT * FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) <> 'admin' ORDER BY id DESC"),
            ]);
            return {
                products: products[0],
                bills: bills[0],
                users: users[0],
                customers: customers[0],
                sales: sales[0],
                refills: refills[0],
                priceHistory: priceHistory[0],
                accounts: accounts[0],
                settings: settings[0]?.[0] || {},
                loginLogs: loginLogs[0],
            };
        }
        finally {
            connection.release();
        }
    }
};
exports.DbController = DbController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DbController.prototype, "info", null);
__decorate([
    (0, common_1.Get)('db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbController.prototype, "getAll", null);
exports.DbController = DbController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DbController);
//# sourceMappingURL=db.controller.js.map