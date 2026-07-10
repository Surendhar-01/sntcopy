"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaSyncService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const database_service_1 = require("./database.service");
const utils_1 = require("../common/utils");
let SchemaSyncService = class SchemaSyncService {
    constructor(db) {
        this.db = db;
        this.schemaExportPromise = Promise.resolve();
        this.schemaExportTableOrder = [
            'users', 'accounts', 'products', 'bills', 'customers',
            'sales', 'refills', 'price_history', 'login_logs', 'shift_reports', 'settings',
        ];
    }
    get schemaSqlPath() {
        return path.resolve(process.cwd(), '../../schema.sql');
    }
    async syncSchemaSql(reason) {
        this.schemaExportPromise = this.schemaExportPromise
            .catch(() => { })
            .then(async () => {
            try {
                await this.writeSnapshot();
                console.log(`schema.sql synced after ${reason}`);
            }
            catch (error) {
                console.error(`Failed to sync schema.sql after ${reason}:`, error);
            }
        });
        await this.schemaExportPromise;
    }
    escapeSqlValue(value) {
        if (value === null || value === undefined)
            return 'NULL';
        if (value instanceof Date)
            return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
        if (typeof value === 'number')
            return Number.isFinite(value) ? String(value) : 'NULL';
        if (typeof value === 'boolean')
            return value ? '1' : '0';
        if (Buffer.isBuffer(value))
            return `X'${value.toString('hex')}'`;
        if (typeof value === 'object')
            return `'${JSON.stringify(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
        return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
    }
    normalizeAccountRowForExport(row) {
        if (!row || typeof row !== 'object')
            return row;
        const username = String(row.user || '').trim();
        if (!username)
            return row;
        if (username.toLowerCase() === 'admin' && (0, utils_1.verifyPassword)('Admin@SNT2026!', row.pass)) {
            return { ...row, pass: 'Admin@SNT2026!' };
        }
        if (username.toLowerCase() === 'manager' && (0, utils_1.verifyPassword)('Manager@SNT2026!', row.pass)) {
            return { ...row, pass: 'Manager@SNT2026!' };
        }
        const staffMatch = username.match(/^staff(\d+)$/i);
        if (staffMatch) {
            const defaultPassword = `Staff${staffMatch[1]}@SNT2026!`;
            if ((0, utils_1.verifyPassword)(defaultPassword, row.pass))
                return { ...row, pass: defaultPassword };
        }
        return row;
    }
    normalizeRow(tableName, row) {
        return tableName === 'accounts' ? this.normalizeAccountRowForExport(row) : row;
    }
    buildInserts(tableName, columns, rows) {
        if (!rows.length)
            return [];
        const columnSql = columns.map((c) => `\`${c}\``).join(', ');
        return rows.map((row) => {
            const normalized = this.normalizeRow(tableName, row);
            const valuesSql = columns.map((c) => this.escapeSqlValue(normalized[c])).join(', ');
            return `INSERT INTO \`${tableName}\` (${columnSql}) VALUES (${valuesSql});`;
        });
    }
    async writeSnapshot() {
        const connection = await this.db.getConnection();
        try {
            const lines = [
                '-- ERP Database Schema',
                '-- Auto-synced from live MySQL database',
                `-- ${new Date().toISOString()}`,
                '',
                `CREATE DATABASE IF NOT EXISTS \`${this.db.dbName}\`;`,
                `USE \`${this.db.dbName}\`;`,
                '',
                'SET FOREIGN_KEY_CHECKS=0;',
                '',
            ];
            for (const [index, tableName] of this.schemaExportTableOrder.entries()) {
                const [existsRows] = await connection.query('SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1', [this.db.dbName, tableName]);
                if (existsRows.length === 0)
                    continue;
                const [createRows] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
                const [columnRows] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
                const hasIdColumn = columnRows.some((c) => c.Field === 'id');
                const [dataRows] = await connection.query(`SELECT * FROM \`${tableName}\`${hasIdColumn ? ' ORDER BY id ASC' : ''}`);
                lines.push('-- ---------------------------------------------------------');
                lines.push(`-- ${index + 1}. Table: ${tableName}`);
                lines.push('-- ---------------------------------------------------------');
                lines.push(`DROP TABLE IF EXISTS \`${tableName}\`;`);
                lines.push(`${createRows[0]['Create Table']};`);
                lines.push('');
                const columns = columnRows.map((c) => c.Field);
                const inserts = this.buildInserts(tableName, columns, dataRows);
                if (inserts.length > 0) {
                    lines.push(`-- Data for ${tableName}`);
                    if (tableName === 'accounts') {
                        lines.push('-- Default account passwords are exported in plain form and hashed on server startup.');
                    }
                    lines.push(...inserts);
                    lines.push('');
                }
            }
            lines.push('SET FOREIGN_KEY_CHECKS=1;');
            lines.push('');
            fs.writeFileSync(this.schemaSqlPath, lines.join('\n'), 'utf8');
        }
        finally {
            connection.release();
        }
    }
};
exports.SchemaSyncService = SchemaSyncService;
exports.SchemaSyncService = SchemaSyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SchemaSyncService);
//# sourceMappingURL=schema-sync.service.js.map