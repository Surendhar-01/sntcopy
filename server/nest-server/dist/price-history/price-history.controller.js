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
exports.PriceHistoryController = void 0;
const common_1 = require("@nestjs/common");
const price_history_service_1 = require("./price-history.service");
let PriceHistoryController = class PriceHistoryController {
    constructor(priceHistoryService) {
        this.priceHistoryService = priceHistoryService;
    }
    findAll() {
        return this.priceHistoryService.findAll();
    }
    create(body) {
        return this.priceHistoryService.create(body);
    }
    async remove(id) {
        const historyId = Number(id);
        if (!Number.isFinite(historyId)) {
            throw new common_1.HttpException('Valid history id is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.priceHistoryService.remove(historyId);
        if (!result) {
            throw new common_1.HttpException('Price history entry not found', common_1.HttpStatus.NOT_FOUND);
        }
        return result;
    }
    clearAll() {
        return this.priceHistoryService.clearAll();
    }
};
exports.PriceHistoryController = PriceHistoryController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PriceHistoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PriceHistoryController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PriceHistoryController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PriceHistoryController.prototype, "clearAll", null);
exports.PriceHistoryController = PriceHistoryController = __decorate([
    (0, common_1.Controller)('api/price-history'),
    __metadata("design:paramtypes", [price_history_service_1.PriceHistoryService])
], PriceHistoryController);
//# sourceMappingURL=price-history.controller.js.map