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
exports.DbService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database.service");
let DbService = class DbService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getAllData() {
        const [[products], [bills], [users], [customers], [sales], [refills], [priceHistory], [accounts], [settings], [loginLogs],] = await Promise.all([
            this.db.query('SELECT * FROM products ORDER BY id DESC'),
            this.db.query('SELECT * FROM bills ORDER BY date DESC'),
            this.db.query('SELECT * FROM users'),
            this.db.query('SELECT * FROM customers ORDER BY id DESC'),
            this.db.query('SELECT * FROM sales ORDER BY date DESC'),
            this.db.query('SELECT * FROM refills ORDER BY date DESC'),
            this.db.query('SELECT * FROM price_history ORDER BY date DESC'),
            this.db.query('SELECT id, user, role FROM accounts ORDER BY id ASC'),
            this.db.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1'),
            this.db.query("SELECT * FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) <> 'admin' ORDER BY id DESC"),
        ]);
        return {
            products,
            bills,
            users,
            customers,
            sales,
            refills,
            priceHistory,
            accounts,
            settings: settings?.[0] || {},
            loginLogs,
        };
    }
};
exports.DbService = DbService;
exports.DbService = DbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DbService);
//# sourceMappingURL=db.service.js.map