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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const schema_sync_service_1 = require("../database/schema-sync.service");
let CustomersController = class CustomersController {
    constructor(db, schemaSync) {
        this.db = db;
        this.schemaSync = schemaSync;
    }
    async findAll() {
        return this.db.query('SELECT * FROM customers ORDER BY id DESC');
    }
    async clearAll() {
        await this.db.query('DELETE FROM customers');
        await this.schemaSync.syncSchemaSql('clear customers');
        return { success: true };
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "clearAll", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('api/customers'),
    __metadata("design:paramtypes", [database_service_1.DatabaseService, schema_sync_service_1.SchemaSyncService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map