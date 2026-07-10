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
exports.ShiftsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const schema_sync_service_1 = require("../database/schema-sync.service");
const mail_service_1 = require("./mail.service");
const utils_1 = require("../common/utils");
let ShiftsService = class ShiftsService {
    constructor(db, schemaSync, mailService) {
        this.db = db;
        this.schemaSync = schemaSync;
        this.mailService = mailService;
    }
    async startShift(data) {
        const shiftUser = String(data.user || '').trim();
        const shiftRole = String(data.role || 'Staff').trim();
        const shiftStart = data.shiftStart ? new Date(data.shiftStart) : new Date();
        if (!shiftUser)
            throw new common_1.HttpException('Shift user is required', common_1.HttpStatus.BAD_REQUEST);
        if (Number.isNaN(shiftStart.getTime()))
            throw new common_1.HttpException('Valid shift start time is required', common_1.HttpStatus.BAD_REQUEST);
        const normalizedRole = shiftRole.toLowerCase();
        if (normalizedRole === 'admin') {
            return { success: true, skipped: true, shiftStart: shiftStart.toISOString(), sessionId: null };
        }
        const [activeSessions] = await this.db.query("SELECT id, loginTime FROM login_logs WHERE user = ? AND status = 'Active' AND logoutTime IS NULL ORDER BY id DESC LIMIT 1", [shiftUser]);
        if (activeSessions.length > 0) {
            return {
                success: true,
                message: 'Active shift session detected',
                sessionId: activeSessions[0].id,
                shiftStart: new Date(activeSessions[0].loginTime).toISOString(),
            };
        }
        const [result] = await this.db.query("INSERT INTO login_logs (user, role, loginTime, logoutTime, status, created_at) VALUES (?, ?, ?, NULL, 'Active', NOW())", [shiftUser, shiftRole, (0, utils_1.toMysqlDateTime)(shiftStart)]);
        await this.schemaSync.syncSchemaSql('start shift');
        return {
            success: true,
            message: 'Next shift started successfully',
            sessionId: result.insertId,
            shiftStart: shiftStart.toISOString(),
        };
    }
    async endShift(data) {
        const shiftUser = String(data.user || '').trim();
        const shiftRole = String(data.role || 'Staff').trim();
        const shiftSessionId = data.sessionId ? Number(data.sessionId) : null;
        const recipientEmail = String(data.recipientEmail || process.env.SHIFT_REPORT_EMAIL || process.env.MAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER || '').trim();
        const shiftStart = data.shiftStart ? new Date(data.shiftStart) : new Date();
        const shiftEnd = new Date();
        if (!shiftUser)
            throw new common_1.HttpException('Shift user is required', common_1.HttpStatus.BAD_REQUEST);
        if (Number.isNaN(shiftStart.getTime()))
            throw new common_1.HttpException('Valid shift start time is required', common_1.HttpStatus.BAD_REQUEST);
        const normalizedRole = shiftRole.toLowerCase();
        if (normalizedRole === 'admin' && !recipientEmail) {
            throw new common_1.HttpException('Report recipient email is not configured', common_1.HttpStatus.BAD_REQUEST);
        }
        const connection = await this.db.getConnection();
        try {
            const shiftStartSql = (0, utils_1.toMysqlDateTime)(shiftStart);
            const shiftEndSql = (0, utils_1.toMysqlDateTime)(shiftEnd);
            const [settingsRows] = await connection.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
            const shopName = String(settingsRows?.[0]?.shop || 'Sri Nikil Tradings').trim();
            const [billRows] = await connection.query('SELECT * FROM bills WHERE by_user = ? AND date BETWEEN ? AND ? ORDER BY date ASC', [
                shiftUser,
                shiftStartSql,
                shiftEndSql,
            ]);
            const [productRows] = await connection.query('SELECT id, name, cat, unit, price, stock, sold FROM products ORDER BY name ASC');
            const [refillRows] = await connection.query('SELECT product, qty, date FROM refills WHERE date BETWEEN ? AND ? ORDER BY date ASC', [
                shiftStartSql,
                shiftEndSql,
            ]);
            const soldByProductId = new Map();
            let totalItemsSold = 0;
            for (const bill of billRows) {
                const items = (0, utils_1.parseItems)(bill.items);
                if (!Array.isArray(items))
                    continue;
                for (const item of items) {
                    const productId = Number(item.id);
                    const qty = Number(item.qty || 0);
                    if (!Number.isFinite(productId) || !Number.isFinite(qty))
                        continue;
                    soldByProductId.set(productId, (soldByProductId.get(productId) || 0) + qty);
                    totalItemsSold += qty;
                }
            }
            const refillByProductName = new Map();
            for (const refill of refillRows) {
                const productName = String(refill.product || '').trim();
                const qty = Number(refill.qty || 0);
                if (!productName || !Number.isFinite(qty))
                    continue;
                refillByProductName.set(productName, (refillByProductName.get(productName) || 0) + qty);
            }
            const remainingStockSummary = (0, utils_1.getRemainingStockSummary)(productRows, soldByProductId, refillByProductName);
            const totalShiftSales = billRows.reduce((sum, bill) => sum + Number(bill.grand || 0), 0);
            const paymentBreakdown = (0, utils_1.getPaymentBreakdown)(billRows);
            const report = {
                user: shiftUser,
                role: shiftRole,
                shiftStart: shiftStart.toISOString(),
                shiftEnd: shiftEnd.toISOString(),
                shiftStartDisplay: shiftStart.toLocaleString('en-GB'),
                shiftEndDisplay: shiftEnd.toLocaleString('en-GB'),
                billsCount: billRows.length,
                totalItemsSold,
                totalSalesAmount: totalShiftSales,
                paymentBreakdown,
                remainingStockSummary,
            };
            let emailStatus = 'skipped';
            let emailError = null;
            let emailSentAtSql = null;
            if (normalizedRole === 'admin') {
                const subject = `Shift Sales Report | ${shopName} | ${shiftUser} | ${shiftEnd.toLocaleDateString('en-GB')}`;
                const html = this.mailService.buildShiftReportHtml({ report, shopName, recipientEmail });
                const text = this.mailService.buildShiftReportText(report);
                const reportFileSuffix = shiftEnd.toISOString().slice(0, 19).replace(/[:T]/g, '-');
                const stockCsv = (0, utils_1.buildCsv)(['Product', 'Category', 'Unit', 'Price', 'Estimated Opening Stock', 'Sold In Shift', 'Refilled In Shift', 'Current Stock', 'Status'], remainingStockSummary.products.map((p) => [p.name, p.category, p.unit, p.price.toFixed(2), p.estimatedOpeningStock, p.soldInShift, p.refilledInShift, p.currentStock, p.status]));
                const salesCsv = (0, utils_1.buildCsv)(['Bill No', 'Date', 'Customer', 'Phone', 'Payment', 'Items', 'Subtotal', 'CGST', 'SGST', 'Grand Total', 'Issued By'], billRows.map((bill) => {
                    const items = (0, utils_1.parseItems)(bill.items);
                    return [bill.billNo, new Date(bill.date).toLocaleString(), bill.customer || '', bill.phone || '', bill.payment || '', Array.isArray(items) ? items.length : 0, Number(bill.subtotal || 0).toFixed(2), Number(bill.cgst || 0).toFixed(2), Number(bill.sgst || 0).toFixed(2), Number(bill.grand || 0).toFixed(2), bill.by_user || shiftUser];
                }));
                try {
                    await this.mailService.sendShiftReportEmail({
                        recipient: recipientEmail,
                        subject,
                        text,
                        html,
                        attachments: [
                            { filename: `shift_report_${shiftUser}_${reportFileSuffix}.html`, content: html },
                            { filename: `sales_shift_${shiftUser}_${reportFileSuffix}.csv`, content: salesCsv },
                            { filename: `stock_shift_${shiftUser}_${reportFileSuffix}.csv`, content: stockCsv },
                        ],
                    });
                    emailStatus = 'sent';
                    emailSentAtSql = shiftEndSql;
                }
                catch (err) {
                    emailStatus = 'failed';
                    emailError = err.message || 'Email sending failed';
                    console.error('Failed to send admin shift mail:', err);
                }
            }
            await connection.beginTransaction();
            if (Number.isFinite(shiftSessionId)) {
                await connection.query('UPDATE login_logs SET logoutTime = ?, status = ? WHERE id = ?', [shiftEndSql, 'Completed', shiftSessionId]);
            }
            else {
                await connection.query('UPDATE login_logs SET logoutTime = ?, status = ? WHERE user = ? AND logoutTime IS NULL ORDER BY id DESC LIMIT 1', [shiftEndSql, 'Completed', shiftUser]);
            }
            await connection.query(`INSERT INTO shift_reports (
          session_id, user, role, shift_start, shift_end, total_bills, total_items_sold, total_sales_amount,
          payment_breakdown, remaining_stock_summary, report_email, report_subject, email_status, email_error, email_sent_at, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
                Number.isFinite(shiftSessionId) ? shiftSessionId : null, shiftUser, shiftRole, shiftStartSql, shiftEndSql,
                billRows.length, totalItemsSold, totalShiftSales, JSON.stringify(paymentBreakdown), JSON.stringify(remainingStockSummary),
                normalizedRole === 'admin' ? recipientEmail : null, normalizedRole === 'admin' ? 'Shift Sales Report' : 'Shift Completed Automatically on Logout',
                emailStatus, emailError, emailSentAtSql, 'Completed',
            ]);
            await connection.commit();
            await this.schemaSync.syncSchemaSql('end shift');
            return {
                success: true,
                message: normalizedRole === 'admin' ? 'Shift closed and report sent successfully' : 'Shift completed automatically',
                emailedTo: normalizedRole === 'admin' ? recipientEmail : null,
                shiftStart: shiftStart.toISOString(),
                shiftEnd: shiftEnd.toISOString(),
                billsCount: billRows.length,
                totalItemsSold,
                totalSales: totalShiftSales,
                paymentBreakdown,
                remainingStockSummary: remainingStockSummary.totals,
                promptNextShift: normalizedRole !== 'admin',
            };
        }
        catch (error) {
            console.error('Failed to end shift:', error);
            throw new common_1.HttpException(error.message || 'Unable to end shift', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        finally {
            connection.release();
        }
    }
};
exports.ShiftsService = ShiftsService;
exports.ShiftsService = ShiftsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        schema_sync_service_1.SchemaSyncService,
        mail_service_1.MailService])
], ShiftsService);
//# sourceMappingURL=shifts.service.js.map