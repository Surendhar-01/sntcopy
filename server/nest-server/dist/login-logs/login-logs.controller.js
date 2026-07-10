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
exports.LoginLogsController = void 0;
const common_1 = require("@nestjs/common");
const login_logs_service_1 = require("./login-logs.service");
let LoginLogsController = class LoginLogsController {
    constructor(loginLogsService) {
        this.loginLogsService = loginLogsService;
    }
    findAll() {
        return this.loginLogsService.findAll();
    }
    create(body) {
        return this.loginLogsService.create(body);
    }
    async logout(id) {
        const logId = Number(id);
        if (!Number.isFinite(logId)) {
            throw new common_1.HttpException('Valid login log id is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.loginLogsService.logout(logId);
        if (!result) {
            throw new common_1.HttpException('Login log not found', common_1.HttpStatus.NOT_FOUND);
        }
        return result;
    }
    async remove(id) {
        const logId = Number(id);
        if (!Number.isFinite(logId)) {
            throw new common_1.HttpException('Valid login log id is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.loginLogsService.remove(logId);
        if (!result) {
            throw new common_1.HttpException('Login log not found', common_1.HttpStatus.NOT_FOUND);
        }
        return result;
    }
    clearAll(roles) {
        return this.loginLogsService.clearAll(roles);
    }
};
exports.LoginLogsController = LoginLogsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LoginLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoginLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id/logout'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoginLogsController.prototype, "logout", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoginLogsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('roles')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoginLogsController.prototype, "clearAll", null);
exports.LoginLogsController = LoginLogsController = __decorate([
    (0, common_1.Controller)('api/login-logs'),
    __metadata("design:paramtypes", [login_logs_service_1.LoginLogsService])
], LoginLogsController);
//# sourceMappingURL=login-logs.controller.js.map