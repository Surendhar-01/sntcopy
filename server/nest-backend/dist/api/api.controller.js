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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const common_1 = require("@nestjs/common");
const api_service_1 = require("./api.service");
let ApiController = class ApiController {
    apiService;
    constructor(apiService) {
        this.apiService = apiService;
    }
    createBill(body) {
        return this.apiService.createBill(body);
    }
    deleteBill(id) {
        return this.apiService.deleteBill(id);
    }
    clearBills() {
        return this.apiService.clearBills();
    }
    createRefill(body) {
        return this.apiService.createRefill(body);
    }
    deleteRefill(id) {
        return this.apiService.deleteRefill(id);
    }
    clearRefills() {
        return this.apiService.clearRefills();
    }
    syncOpeningStock() {
        return this.apiService.syncOpeningStock();
    }
    repairStock() {
        return this.apiService.repairStock();
    }
    createPriceHistory(body) {
        return this.apiService.createPriceHistory(body);
    }
    deletePriceHistory(id) {
        return this.apiService.deletePriceHistory(id);
    }
    clearPriceHistory() {
        return this.apiService.clearPriceHistory();
    }
    updateProductPrice(id, body) {
        return this.apiService.updateProductPrice(id, body);
    }
    createProduct(body) {
        return this.apiService.createProduct(body);
    }
    deleteProduct(id) {
        return this.apiService.deleteProduct(id);
    }
    createAccount(body) {
        return this.apiService.createAccount(body);
    }
    updateAccountPassword(user, body) {
        return this.apiService.updateAccountPassword(user, body);
    }
    deleteAccount(user) {
        return this.apiService.deleteAccount(user);
    }
    clearCustomers() {
        return this.apiService.clearCustomers();
    }
    resetSalesData() {
        return this.apiService.resetSalesData();
    }
    createLoginLog(body) {
        return this.apiService.createLoginLog(body);
    }
    logout(id) {
        return this.apiService.logout(id);
    }
    deleteLoginLog(id) {
        return this.apiService.deleteLoginLog(id);
    }
    clearLoginLogs() {
        return this.apiService.clearLoginLogs();
    }
    startShift(body) {
        return this.apiService.startShift(body);
    }
    endShift(body) {
        return this.apiService.endShift(body);
    }
    updateSettings(body) {
        return this.apiService.updateSettings(body);
    }
    getSettings() {
        return this.apiService.getSettings();
    }
    getProducts() {
        return this.apiService.getProducts();
    }
    getBills() {
        return this.apiService.getBills();
    }
    getCustomers() {
        return this.apiService.getCustomers();
    }
    getRefills() {
        return this.apiService.getRefills();
    }
    getPriceHistory() {
        return this.apiService.getPriceHistory();
    }
    getLoginLogs() {
        return this.apiService.getLoginLogs();
    }
    getAccounts() {
        return this.apiService.getAccounts();
    }
};
exports.ApiController = ApiController;
__decorate([
    (0, common_1.Post)('bills'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "createBill", null);
__decorate([
    (0, common_1.Delete)('bills/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "deleteBill", null);
__decorate([
    (0, common_1.Delete)('bills'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "clearBills", null);
__decorate([
    (0, common_1.Post)('refills'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "createRefill", null);
__decorate([
    (0, common_1.Delete)('refills/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "deleteRefill", null);
__decorate([
    (0, common_1.Delete)('refills'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "clearRefills", null);
__decorate([
    (0, common_1.Put)('products/opening-stock/sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "syncOpeningStock", null);
__decorate([
    (0, common_1.Post)('stock/repair'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "repairStock", null);
__decorate([
    (0, common_1.Post)('price-history'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "createPriceHistory", null);
__decorate([
    (0, common_1.Delete)('price-history/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "deletePriceHistory", null);
__decorate([
    (0, common_1.Delete)('price-history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "clearPriceHistory", null);
__decorate([
    (0, common_1.Put)('products/:id/price'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "updateProductPrice", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Post)('accounts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Put)('accounts/:user/password'),
    __param(0, (0, common_1.Param)('user')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "updateAccountPassword", null);
__decorate([
    (0, common_1.Delete)('accounts/:user'),
    __param(0, (0, common_1.Param)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Delete)('customers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "clearCustomers", null);
__decorate([
    (0, common_1.Post)('reset-sales-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "resetSalesData", null);
__decorate([
    (0, common_1.Post)('login-logs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "createLoginLog", null);
__decorate([
    (0, common_1.Put)('login-logs/:id/logout'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "logout", null);
__decorate([
    (0, common_1.Delete)('login-logs/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "deleteLoginLog", null);
__decorate([
    (0, common_1.Delete)('login-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "clearLoginLogs", null);
__decorate([
    (0, common_1.Post)('shifts/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "startShift", null);
__decorate([
    (0, common_1.Post)('shifts/end'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "endShift", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('bills'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getBills", null);
__decorate([
    (0, common_1.Get)('customers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)('refills'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getRefills", null);
__decorate([
    (0, common_1.Get)('price-history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getPriceHistory", null);
__decorate([
    (0, common_1.Get)('login-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getLoginLogs", null);
__decorate([
    (0, common_1.Get)('accounts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getAccounts", null);
exports.ApiController = ApiController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [api_service_1.ApiService])
], ApiController);
//# sourceMappingURL=api.controller.js.map