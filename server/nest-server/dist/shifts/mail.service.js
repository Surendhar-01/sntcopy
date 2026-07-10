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
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dotenv = __importStar(require("dotenv"));
const utils_1 = require("../common/utils");
let MailService = class MailService {
    constructor() {
        this.transporter = null;
        this.currentEnvSig = '';
    }
    refreshRuntimeMailEnv() {
        const envCandidate = path.resolve(process.cwd(), '../../.env.development');
        if (fs.existsSync(envCandidate)) {
            const rawEnv = fs.readFileSync(envCandidate, 'utf-8');
            const parsedEnv = dotenv.parse(rawEnv);
            for (const [key, val] of Object.entries(parsedEnv)) {
                process.env[key] = val;
            }
        }
    }
    initTransporter() {
        this.refreshRuntimeMailEnv();
        const mailHost = process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
        const mailPort = Number.parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '587', 10);
        const mailUser = process.env.MAIL_USER || process.env.SMTP_USER || '';
        const mailPass = process.env.MAIL_PASS || process.env.SMTP_PASS || '';
        const mailFrom = process.env.MAIL_FROM || process.env.SMTP_FROM || mailUser;
        const newSig = `${mailHost}:${mailPort}:${mailUser}:${mailPass}`;
        if (this.transporter && this.currentEnvSig === newSig) {
            return this.transporter;
        }
        this.currentEnvSig = newSig;
        if (!mailUser || !mailPass) {
            this.transporter = null;
            return null;
        }
        this.transporter = nodemailer.createTransport({
            host: mailHost,
            port: mailPort,
            secure: mailPort === 465,
            auth: {
                user: mailUser,
                pass: mailPass,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        this.transporter._defaultFrom = mailFrom;
        return this.transporter;
    }
    async sendShiftReportEmail(options) {
        const tp = this.initTransporter();
        if (!tp) {
            throw new Error('Email configuration is incomplete or missing in .env.development. Please configure MAIL_USER and MAIL_PASS.');
        }
        const mailOptions = {
            from: `"ERP System" <${tp._defaultFrom}>`,
            to: options.recipient,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments || [],
        };
        return await tp.sendMail(mailOptions);
    }
    buildShiftReportText(report) {
        const pbText = Object.entries(report.paymentBreakdown || {})
            .map(([method, amount]) => `  - ${method}: Rs ${amount.toFixed(2)}`)
            .join('\n');
        let stockText = '';
        if (report.remainingStockSummary?.totals) {
            const totals = report.remainingStockSummary.totals;
            stockText = `
Stock Summary:
  - Total Products: ${totals.totalProducts}
  - Healthy: ${totals.healthyCount}
  - Low Stock: ${totals.lowStockCount}
  - Out of Stock: ${totals.outOfStockCount}
      `.trim();
        }
        return `
Shift Report
------------
User: ${report.user} (${report.role})
Start: ${report.shiftStartDisplay}
End: ${report.shiftEndDisplay}

Sales Summary:
  - Total Bills: ${report.billsCount}
  - Total Items Sold: ${report.totalItemsSold}
  - Total Sales Amount: Rs ${report.totalSalesAmount.toFixed(2)}

Payment Breakdown:
${pbText || '  (None)'}

${stockText}

Please see attached HTML, Sales CSV, and Stock CSV for full details.
    `.trim();
    }
    buildShiftReportHtml({ report, shopName, recipientEmail }) {
        const pbHtml = Object.entries(report.paymentBreakdown || {})
            .map(([method, amount]) => `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; text-transform: capitalize;">${(0, utils_1.escapeHtml)(method)}</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #2ecc71;">Rs ${amount.toFixed(2)}</td></tr>`)
            .join('');
        let stockTotalsHtml = '<tr><td colspan="2" style="padding: 10px; color: #666; font-style: italic;">Stock summary not available</td></tr>';
        let productsHtml = '';
        if (report.remainingStockSummary?.totals) {
            const totals = report.remainingStockSummary.totals;
            stockTotalsHtml = `
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Total Tracked Products</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${totals.totalProducts}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Healthy Stock Levels</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #2ecc71;">${totals.healthyCount}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Low Stock Items</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #f39c12;">${totals.lowStockCount}</td></tr>
        <tr><td style="padding: 10px;">Out of Stock Items</td><td style="padding: 10px; text-align: right; font-weight: bold; color: #e74c3c;">${totals.outOfStockCount}</td></tr>
      `;
        }
        if (report.remainingStockSummary?.products && Array.isArray(report.remainingStockSummary.products)) {
            productsHtml = report.remainingStockSummary.products
                .map((p) => {
                let statusBadge = `<span style="background: #2ecc71; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em;">Healthy</span>`;
                let rowStyle = '';
                if (p.status === 'Low Stock' && p.currentStock > 0) {
                    statusBadge = `<span style="background: #f39c12; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em;">Low</span>`;
                    rowStyle = 'background-color: #fff9e6;';
                }
                else if (p.currentStock === 0) {
                    statusBadge = `<span style="background: #e74c3c; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em;">Empty</span>`;
                    rowStyle = 'background-color: #ffe6e6;';
                }
                return `
          <tr style="${rowStyle}">
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${(0, utils_1.escapeHtml)(p.name)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${p.estimatedOpeningStock}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; color: #e74c3c;">${p.soldInShift > 0 ? '-' + p.soldInShift : 0}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; color: #3498db;">${p.refilledInShift > 0 ? '+' + p.refilledInShift : 0}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">${p.currentStock}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${statusBadge}</td>
          </tr>
        `;
            })
                .join('');
        }
        return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; color: #333; background: #f9f9f9; padding: 20px;">
        <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: #2c3e50; color: white; padding: 25px 30px; text-align: center; border-bottom: 5px solid #3498db;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">${(0, utils_1.escapeHtml)(shopName)}</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">End of Shift Sales & Stock Report</p>
          </div>
          <div style="padding: 30px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background: #f8f9fa; border-radius: 6px;">
              <tr>
                <td style="padding: 15px; width: 50%; border-right: 1px solid #eee;">
                  <span style="font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px;">Shift Managed By</span><br/>
                  <strong style="font-size: 18px; color: #2c3e50;">${(0, utils_1.escapeHtml)(report.user)}</strong>
                  <span style="display: inline-block; background: #3498db; color: white; font-size: 11px; padding: 2px 8px; border-radius: 12px; margin-left: 10px; vertical-align: middle;">${(0, utils_1.escapeHtml)(report.role)}</span>
                </td>
                <td style="padding: 15px; width: 50%;">
                  <span style="font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px;">Report Sent To</span><br/>
                  <strong style="font-size: 16px; color: #2c3e50;">${(0, utils_1.escapeHtml)(recipientEmail)}</strong>
                </td>
              </tr>
            </table>

            <!-- Summary Blocks... -->
            <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px;">
               <!-- Implementation matches previous index.js structure... -->
               <div style="flex: 1; min-width: 200px; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e8ed; text-align: center;">
                  <h3 style="margin: 0 0 10px 0; color: #7f8c8d; font-size: 14px; text-transform: uppercase;">Total Sales</h3>
                  <div style="font-size: 28px; font-weight: bold; color: #2ecc71;">Rs ${report.totalSalesAmount.toFixed(2)}</div>
               </div>
               <div style="flex: 1; min-width: 200px; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e8ed; text-align: center;">
                  <h3 style="margin: 0 0 10px 0; color: #7f8c8d; font-size: 14px; text-transform: uppercase;">Bills Generated</h3>
                  <div style="font-size: 28px; font-weight: bold; color: #3498db;">${report.billsCount}</div>
               </div>
            </div>
            
            ${productsHtml
            ? `
            <div style="margin-top: 40px;">
              <h2 style="font-size: 18px; color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px;">Item-Level Stock Activity</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 15px;">
                <thead>
                  <tr style="background-color: #f1f2f6; text-align: left;">
                    <th style="padding: 10px; border-bottom: 2px solid #dfe4ea;">Product</th>
                    <th style="padding: 10px; border-bottom: 2px solid #dfe4ea; text-align: center;">Opening</th>
                    <th style="padding: 10px; border-bottom: 2px solid #dfe4ea; text-align: center;">Sold</th>
                    <th style="padding: 10px; border-bottom: 2px solid #dfe4ea; text-align: center;">Refill</th>
                    <th style="padding: 10px; border-bottom: 2px solid #dfe4ea; text-align: center;">Closing</th>
                    <th style="padding: 10px; border-bottom: 2px solid #dfe4ea; text-align: center;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
              </table>
            </div>`
            : ''}
          </div>
        </div>
      </div>
    `.trim();
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map