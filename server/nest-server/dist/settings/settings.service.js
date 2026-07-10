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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const schema_sync_service_1 = require("../database/schema-sync.service");
let SettingsService = class SettingsService {
    constructor(db, schemaSync) {
        this.db = db;
        this.schemaSync = schemaSync;
    }
    async findOne() {
        const rows = await this.db.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
        return rows?.[0] || {};
    }
    async update(data) {
        const normalizedSettings = [
            Number(data.gst ?? 0),
            data.shop || '',
            data.addr || '',
            data.gstin || '',
            data.fssai || '',
            data.phone || '',
        ];
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [settingsRows] = await connection.query('SELECT id FROM settings ORDER BY id ASC LIMIT 1');
            if (settingsRows.length === 0) {
                const [insertResult] = await connection.query('INSERT INTO settings (gst, shop, addr, gstin, fssai, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', normalizedSettings);
                await connection.commit();
                await this.schemaSync.syncSchemaSql('create settings');
                return {
                    success: true,
                    id: insertResult.insertId,
                    settings: this.mapSettings(normalizedSettings),
                };
            }
            await connection.query('UPDATE settings SET gst=?, shop=?, addr=?, gstin=?, fssai=?, phone=? WHERE id = ?', [
                ...normalizedSettings,
                settingsRows[0].id,
            ]);
            await connection.commit();
            await this.schemaSync.syncSchemaSql('update settings');
            return {
                success: true,
                id: settingsRows[0].id,
                settings: this.mapSettings(normalizedSettings),
            };
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    mapSettings(arr) {
        return {
            gst: arr[0],
            shop: arr[1],
            addr: arr[2],
            gstin: arr[3],
            fssai: arr[4],
            phone: arr[5],
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        schema_sync_service_1.SchemaSyncService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map