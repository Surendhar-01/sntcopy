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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const mysql = __importStar(require("mysql2/promise"));
const utils_1 = require("../common/utils");
let DatabaseService = class DatabaseService {
    get dbName() {
        return process.env.DB_DATABASE || process.env.DB_NAME || 'sridb';
    }
    get dbPort() {
        return Number(process.env.DB_PORT || 3306);
    }
    async onModuleInit() {
        await this.initializeDatabase();
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: this.dbName,
            port: this.dbPort,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        await this.pool.query('SELECT 1');
        await this.migrateLegacyAccountPasswords();
        console.log('Database connected successfully');
    }
    async onModuleDestroy() {
        if (this.pool)
            await this.pool.end();
    }
    getPool() {
        return this.pool;
    }
    async query(sql, params) {
        const [rows] = await this.pool.query(sql, params);
        return rows;
    }
    async getConnection() {
        return this.pool.getConnection();
    }
    async initializeDatabase() {
        const tempConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: this.dbPort,
        });
        try {
            await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${this.dbName}\``);
            await tempConnection.query(`USE \`${this.dbName}\``);
            const tableDefinitions = {
                users: `CREATE TABLE IF NOT EXISTS \`users\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`username\` VARCHAR(255) NOT NULL UNIQUE, \`password\` VARCHAR(255) NOT NULL, \`role\` VARCHAR(50) NOT NULL DEFAULT 'User', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                accounts: `CREATE TABLE IF NOT EXISTS \`accounts\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`user\` VARCHAR(255) NOT NULL UNIQUE, \`pass\` VARCHAR(255) NOT NULL, \`role\` VARCHAR(50) NOT NULL DEFAULT 'Staff', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                products: `CREATE TABLE IF NOT EXISTS \`products\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`name\` VARCHAR(255) NOT NULL, \`code\` VARCHAR(100) UNIQUE, \`cat\` VARCHAR(100), \`unit\` VARCHAR(50), \`price\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`stock\` INT NOT NULL DEFAULT 0, \`sold\` INT NOT NULL DEFAULT 0, \`image\` TEXT, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                bills: `CREATE TABLE IF NOT EXISTS \`bills\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`billNo\` VARCHAR(255) NOT NULL, \`customer\` VARCHAR(255), \`phone\` VARCHAR(20), \`payment\` VARCHAR(50), \`date\` DATETIME NOT NULL, \`subtotal\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`cgst\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`sgst\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`grand\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`items\` LONGTEXT, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                customers: `CREATE TABLE IF NOT EXISTS \`customers\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`name\` VARCHAR(255) NOT NULL, \`phone\` VARCHAR(50) UNIQUE, \`visits\` INT NOT NULL DEFAULT 0, \`total\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`firstVisit\` DATETIME, \`lastVisit\` DATETIME, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                sales: `CREATE TABLE IF NOT EXISTS \`sales\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`billNo\` VARCHAR(255), \`customer\` VARCHAR(255), \`product\` VARCHAR(255), \`qty\` INT NOT NULL DEFAULT 0, \`amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                refills: `CREATE TABLE IF NOT EXISTS \`refills\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`product\` VARCHAR(255), \`qty\` INT NOT NULL DEFAULT 0, \`by\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                price_history: `CREATE TABLE IF NOT EXISTS \`price_history\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`product\` VARCHAR(255), \`old\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`new\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`by\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                login_logs: `CREATE TABLE IF NOT EXISTS \`login_logs\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`user\` VARCHAR(255), \`role\` VARCHAR(50), \`loginTime\` DATETIME, \`logoutTime\` DATETIME, \`status\` VARCHAR(50) NOT NULL DEFAULT 'Active', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                shift_reports: `CREATE TABLE IF NOT EXISTS \`shift_reports\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`session_id\` INT NULL, \`user\` VARCHAR(255) NOT NULL, \`role\` VARCHAR(50) NOT NULL DEFAULT 'Staff', \`shift_start\` DATETIME NOT NULL, \`shift_end\` DATETIME NOT NULL, \`total_bills\` INT NOT NULL DEFAULT 0, \`total_items_sold\` INT NOT NULL DEFAULT 0, \`total_sales_amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`payment_breakdown\` JSON NULL, \`remaining_stock_summary\` JSON NULL, \`report_email\` VARCHAR(255) NULL, \`report_subject\` VARCHAR(255) NULL, \`email_status\` VARCHAR(50) NOT NULL DEFAULT 'pending', \`email_error\` TEXT NULL, \`email_sent_at\` DATETIME NULL, \`status\` VARCHAR(50) NOT NULL DEFAULT 'Completed', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
                settings: `CREATE TABLE IF NOT EXISTS \`settings\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`gst\` DECIMAL(5, 2) NOT NULL DEFAULT 0.00, \`shop\` VARCHAR(255), \`addr\` TEXT, \`gstin\` VARCHAR(100), \`fssai\` VARCHAR(100), \`phone\` VARCHAR(100), \`logo\` TEXT, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
            };
            for (const [tableName, query] of Object.entries(tableDefinitions)) {
                try {
                    await tempConnection.query(query);
                }
                catch (err) {
                    console.warn(`Failed to create/verify table ${tableName}:`, err.message);
                }
            }
            try {
                const [adminRows] = await tempConnection.query("SELECT 1 FROM accounts WHERE LOWER(TRIM(user)) = 'admin' LIMIT 1");
                if (adminRows.length === 0) {
                    await tempConnection.query("INSERT INTO accounts (`user`,`pass`,`role`) VALUES (?, ?, ?)", ['admin', 'Admin@SNT2026!', 'Admin']);
                }
                const [managerRows] = await tempConnection.query("SELECT 1 FROM accounts WHERE LOWER(TRIM(user)) = 'manager' LIMIT 1");
                if (managerRows.length === 0) {
                    await tempConnection.query("INSERT INTO accounts (`user`,`pass`,`role`) VALUES (?, ?, ?)", ['manager', 'Manager@SNT2026!', 'Manager']);
                }
            }
            catch (err) {
                console.warn('Failed to ensure default accounts exist:', err.message);
            }
            const [customerCols] = await tempConnection.query('SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?', [this.dbName, 'customers', 'firstVisit']);
            if (customerCols.length === 0) {
                await tempConnection.query('ALTER TABLE `customers` ADD COLUMN firstVisit DATETIME NULL AFTER total');
            }
            const [billNoUniqueIndexes] = await tempConnection.query(`SELECT INDEX_NAME FROM information_schema.statistics WHERE table_schema = ? AND table_name = 'bills' AND column_name = 'billNo' AND non_unique = 0`, [this.dbName]);
            for (const indexRow of billNoUniqueIndexes) {
                if (indexRow?.INDEX_NAME) {
                    await tempConnection.query(`ALTER TABLE \`bills\` DROP INDEX \`${indexRow.INDEX_NAME}\``);
                }
            }
            const [deviceCols] = await tempConnection.query('SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?', [this.dbName, 'login_logs', 'device']);
            if (deviceCols.length > 0) {
                await tempConnection.query('ALTER TABLE `login_logs` DROP COLUMN `device`');
            }
            const [loginLogsStatusCols] = await tempConnection.query('SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?', [this.dbName, 'login_logs', 'status']);
            if (loginLogsStatusCols.length === 0) {
                await tempConnection.query("ALTER TABLE `login_logs` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'Active'");
            }
            const [shiftReportsStatusCols] = await tempConnection.query('SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?', [this.dbName, 'shift_reports', 'status']);
            if (shiftReportsStatusCols.length === 0) {
                await tempConnection.query("ALTER TABLE `shift_reports` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'Completed'");
            }
        }
        finally {
            await tempConnection.end();
        }
    }
    async migrateLegacyAccountPasswords() {
        const [tableRows] = await this.pool.query('SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1', [this.dbName, 'accounts']);
        if (tableRows.length === 0)
            return;
        const [rows] = await this.pool.query('SELECT id, pass FROM accounts');
        for (const account of rows) {
            if (!(0, utils_1.isHashedPassword)(account.pass)) {
                const upgradedHash = (0, utils_1.hashPassword)(account.pass || '');
                await this.pool.query('UPDATE accounts SET pass = ? WHERE id = ?', [upgradedHash, account.id]);
            }
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map