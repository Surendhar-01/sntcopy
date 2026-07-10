"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const db_module_1 = require("./db/db.module");
const products_module_1 = require("./products/products.module");
const bills_module_1 = require("./bills/bills.module");
const customers_module_1 = require("./customers/customers.module");
const refills_module_1 = require("./refills/refills.module");
const price_history_module_1 = require("./price-history/price-history.module");
const accounts_module_1 = require("./accounts/accounts.module");
const login_logs_module_1 = require("./login-logs/login-logs.module");
const shifts_module_1 = require("./shifts/shifts.module");
const settings_module_1 = require("./settings/settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            db_module_1.DbModule,
            products_module_1.ProductsModule,
            bills_module_1.BillsModule,
            customers_module_1.CustomersModule,
            refills_module_1.RefillsModule,
            price_history_module_1.PriceHistoryModule,
            accounts_module_1.AccountsModule,
            login_logs_module_1.LoginLogsModule,
            shifts_module_1.ShiftsModule,
            settings_module_1.SettingsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map