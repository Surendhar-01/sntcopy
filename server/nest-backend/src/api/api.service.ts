import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { hashPassword } from '../utils';

function toMysqlDateTime(value?: string | Date) {
  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return now.toLocaleString('sv').replace('T', ' ').slice(0, 19);
  }
  return parsed.toLocaleString('sv').replace('T', ' ').slice(0, 19);
}

@Injectable()
export class ApiService {
  constructor(private readonly db: DatabaseService) {}

  async getNextBillNo(connection: any) {
    const [rows] = await connection.query(
      "SELECT billNo FROM bills WHERE billNo LIKE 'SNT-%' ORDER BY CAST(SUBSTRING_INDEX(billNo, '-', -1) AS UNSIGNED) DESC LIMIT 1",
    );
    const current = rows?.[0]?.billNo || '';
    const match = String(current).match(/SNT-(\d+)/i);
    const seq = match ? Number(match[1]) + 1 : 1000;
    return `SNT-${String(seq).padStart(4, '0')}`;
  }

  // --- Bills ---
  async createBill(body: any) {
    const {
      billNo,
      customer,
      phone,
      payment,
      date,
      subtotal,
      cgst,
      sgst,
      grand,
      items,
      by_user,
    } = body;
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      const saleDate = toMysqlDateTime(date);

      let billNoToUse = String(billNo || '').trim();
      if (!billNoToUse) {
        billNoToUse = await this.getNextBillNo(connection);
      } else {
        const [existing] = await connection.query(
          'SELECT id FROM bills WHERE billNo = ? LIMIT 1',
          [billNoToUse],
        );
        if ((existing as any[]).length > 0) {
          billNoToUse = await this.getNextBillNo(connection);
        }
      }

      const [result] = await connection.query(
        'INSERT INTO bills (billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, items, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [
          billNoToUse,
          customer,
          phone,
          payment,
          saleDate,
          subtotal,
          cgst,
          sgst,
          grand,
          JSON.stringify(items || []),
          by_user,
        ],
      );

      if (Array.isArray(items)) {
        for (const item of items) {
          await connection.query(
            'UPDATE products SET stock = GREATEST(0, stock - ?), sold = sold + ? WHERE id = ?',
            [item.qty, item.qty, item.id],
          );
          await connection.query(
            'INSERT INTO sales (date, billNo, customer, product, qty, amount, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [
              saleDate,
              billNoToUse,
              customer || null,
              item.name,
              item.qty,
              item.total || item.qty * item.price,
              by_user || null,
            ],
          );
        }
      }

      if (customer) {
        await connection.query(
          'INSERT INTO customers (`name`, `phone`, `visits`, `total`, `firstVisit`, `lastVisit`) VALUES (?, ?, 1, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `visits` = `visits` + 1, `total` = `total` + VALUES(`total`), `firstVisit` = IFNULL(LEAST(`firstVisit`, VALUES(`firstVisit`)), VALUES(`firstVisit`)), `lastVisit` = IFNULL(GREATEST(`lastVisit`, VALUES(`lastVisit`)), VALUES(`lastVisit`))',
          [customer, phone || null, grand || 0, saleDate, saleDate],
        );
      }

      await connection.commit();
      return { id: (result as any).insertId, billNo: billNoToUse };
    } catch {
      await connection.rollback();
      throw new InternalServerErrorException('Unable to save bill');
    } finally {
      connection.release();
    }
  }

  async deleteBill(id: number) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      const [bills] = await connection.query(
        'SELECT * FROM bills WHERE id = ?',
        [id],
      );
      if ((bills as any[]).length === 0) {
        await connection.rollback();
        throw new NotFoundException('Bill not found');
      }

      const bill = bills[0];
      const items =
        typeof bill.items === 'string' ? JSON.parse(bill.items) : bill.items;

      if (Array.isArray(items)) {
        for (const item of items) {
          await connection.query(
            'UPDATE products SET stock = stock + ?, sold = GREATEST(0, sold - ?) WHERE id = ?',
            [item.qty, item.qty, item.id],
          );
        }
      }

      await connection.query('DELETE FROM bills WHERE id = ?', [id]);
      await connection.query('DELETE FROM sales WHERE billNo = ?', [
        bill.billNo,
      ]);
      await connection.commit();
      return { success: true };
    } catch {
      await connection.rollback();
      throw new InternalServerErrorException('Unable to delete bill');
    } finally {
      connection.release();
    }
  }

  async clearBills() {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      const [bills] = await connection.query('SELECT items FROM bills');
      const rollbackByProductId = new Map();

      for (const bill of bills as any[]) {
        const parsedItems =
          typeof bill.items === 'string'
            ? JSON.parse(bill.items || '[]')
            : bill.items || [];
        if (!Array.isArray(parsedItems)) continue;

        for (const item of parsedItems) {
          const productId = Number(item.id);
          const qty = Number(item.qty || 0);
          if (!Number.isFinite(productId) || !Number.isFinite(qty) || qty <= 0)
            continue;
          rollbackByProductId.set(
            productId,
            (rollbackByProductId.get(productId) || 0) + qty,
          );
        }
      }

      for (const [productId, qty] of rollbackByProductId.entries()) {
        await connection.query(
          'UPDATE products SET stock = stock + ?, sold = GREATEST(0, sold - ?) WHERE id = ?',
          [qty, qty, productId],
        );
      }

      await connection.query('DELETE FROM bills');
      await connection.query('DELETE FROM customers');
      await connection.query('DELETE FROM sales');
      await connection.commit();
      return { success: true };
    } catch {
      await connection.rollback();
      throw new InternalServerErrorException('Unable to clear bills');
    } finally {
      connection.release();
    }
  }

  // --- Refills ---
  async createRefill(body: any) {
    const { product, qty, by, by_user, date } = body;
    const refillQty = Number.parseInt(qty, 10);
    if (!product || !Number.isFinite(refillQty) || refillQty <= 0)
      throw new BadRequestException(
        'Product and positive quantity are required',
      );

    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      const [productRows] = await connection.query(
        'SELECT id, name, price, stock, sold, opening_stock FROM products WHERE name = ? FOR UPDATE',
        [product],
      );

      if ((productRows as any[]).length === 0) {
        await connection.rollback();
        throw new NotFoundException('Product not found for refill');
      }

      const [updateResult] = await connection.query(
        'UPDATE products SET opening_stock = stock + ?, stock = stock + ? WHERE name = ?',
        [refillQty, refillQty, product],
      );

      if ((updateResult as any).affectedRows === 0) {
        await connection.rollback();
        throw new NotFoundException('Product not found for refill');
      }

      const [result] = await connection.query(
        'INSERT INTO refills (product, qty, `by`, date, created_at) VALUES (?, ?, ?, ?, NOW())',
        [product, refillQty, by || by_user || 'system', toMysqlDateTime(date)],
      );

      await connection.commit();
      return { id: (result as any).insertId };
    } catch {
      await connection.rollback();
      throw new InternalServerErrorException('Unable to save refill');
    } finally {
      connection.release();
    }
  }

  async deleteRefill(id: number) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(
        'SELECT id, product, qty FROM refills WHERE id = ? LIMIT 1',
        [id],
      );
      if ((rows as any[]).length === 0) {
        await connection.rollback();
        throw new NotFoundException('Refill record not found');
      }
      const refill = rows[0];
      await connection.query(
        'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE name = ?',
        [Number(refill.qty || 0), refill.product],
      );
      await connection.query('DELETE FROM refills WHERE id = ?', [id]);
      await connection.commit();
      return { success: true };
    } catch {
      await connection.rollback();
      throw new InternalServerErrorException('Unable to delete refill');
    } finally {
      connection.release();
    }
  }

  async clearRefills() {
    await this.db.query('DELETE FROM refills');
    await this.db.query('UPDATE products SET opening_stock = stock');
    return { success: true };
  }

  async syncOpeningStock() {
    await this.db.query('UPDATE products SET opening_stock = stock');
    return { success: true };
  }

  // --- Price History ---
  async createPriceHistory(body: any) {
    const { product, old, new: newPrice, by, date } = body;
    const [result] = await this.db.query(
      'INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [product, old, newPrice, by || 'system', date || new Date()],
    );
    return { id: result.insertId };
  }

  async deletePriceHistory(id: number) {
    const [result] = await this.db.query(
      'DELETE FROM price_history WHERE id = ?',
      [id],
    );
    if (result.affectedRows === 0)
      throw new NotFoundException('Price history entry not found');
    return { success: true };
  }

  async clearPriceHistory() {
    await this.db.query('DELETE FROM price_history');
    return { success: true };
  }

  // --- Products ---
  async updateProductPrice(id: number, body: any) {
    const newPrice = Number(body?.new_price);
    const byUser = body?.by_user || 'system';

    if (!Number.isFinite(newPrice) || newPrice < 0)
      throw new BadRequestException('Valid new price is required');

    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      const [products] = await connection.query(
        'SELECT name, price FROM products WHERE id = ? LIMIT 1',
        [id],
      );
      if ((products as any[]).length === 0) {
        await connection.rollback();
        throw new NotFoundException('Product not found');
      }
      const product = products[0];
      const oldPrice = Number(product.price || 0);

      await connection.query('UPDATE products SET price = ? WHERE id = ?', [
        newPrice,
        id,
      ]);
      await connection.query(
        'INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [product.name, oldPrice, newPrice, byUser, toMysqlDateTime(body?.date)],
      );

      await connection.commit();
      return { success: true };
    } catch {
      await connection.rollback();
      throw new InternalServerErrorException('Unable to update product price');
    } finally {
      connection.release();
    }
  }

  async createProduct(body: any) {
    const { code, name, cat, unit, price, stock, image } = body;
    const [result] = await this.db.query(
      'INSERT INTO products (code, name, cat, unit, price, stock, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [code, name, cat, unit, price, stock, image],
    );
    return { id: result.insertId };
  }

  async deleteProduct(id: number) {
    await this.db.query('DELETE FROM products WHERE id = ?', [id]);
    return { success: true };
  }

  // --- Accounts ---
  async createAccount(body: any) {
    const { user, password, role } = body;
    const hashedPassword = hashPassword(password || '');
    const [result] = await this.db.query(
      'INSERT INTO accounts (user, pass, role, created_at) VALUES (?, ?, ?, NOW())',
      [user, hashedPassword, role || 'Staff'],
    );
    return { id: result.insertId };
  }

  async updateAccountPassword(username: string, body: any) {
    const nextPassword = String(body?.password || '');
    if (!username || !nextPassword)
      throw new BadRequestException('Username and password are required');
    const hashedPassword = hashPassword(nextPassword);
    const [result] = await this.db.query(
      'UPDATE accounts SET pass = ? WHERE user = ?',
      [hashedPassword, username],
    );
    if (result.affectedRows === 0)
      throw new NotFoundException('Account not found');
    return { success: true };
  }

  async deleteAccount(username: string) {
    await this.db.query('DELETE FROM accounts WHERE user = ?', [username]);
    return { success: true };
  }

  // --- Customers ---
  async clearCustomers() {
    await this.db.query('DELETE FROM customers');
    return { success: true };
  }

  // --- Login Logs ---
  async createLoginLog(body: any) {
    const { user_name, role } = body;
    const normalizedRole = String(role || '')
      .trim()
      .toLowerCase();
    if (normalizedRole === 'admin') return { skipped: true };

    const [result] = await this.db.query(
      'INSERT INTO login_logs (user, role, loginTime, created_at) VALUES (?, ?, NOW(), NOW())',
      [user_name, role],
    );
    return { id: result.insertId };
  }

  async logout(id: number) {
    await this.db.query(
      "UPDATE login_logs SET logoutTime = NOW(), status = 'Completed' WHERE id = ?",
      [id],
    );
    return { success: true };
  }

  async deleteLoginLog(id: number) {
    await this.db.query('DELETE FROM login_logs WHERE id = ?', [id]);
    return { success: true };
  }

  async clearLoginLogs() {
    await this.db.query('DELETE FROM login_logs');
    return { success: true };
  }

  // --- Settings ---
  async updateSettings(body: any) {
    const { updateType, value } = body;
    const updateColumn = 'themePreference';
    if (updateType !== updateColumn) {
      return { success: true };
    }

    await this.db.query(`UPDATE settings SET ?? = ? WHERE id = 1`, [
      updateColumn,
      value,
    ]);
    return { success: true };
  }

  // --- Shifts ---
  async startShift(body: any) {
    const shiftUser = String(body?.user || '').trim();
    const shiftRole = String(body?.role || 'Staff').trim();
    const shiftStart = body?.shiftStart
      ? new Date(body.shiftStart)
      : new Date();

    if (!shiftUser) throw new BadRequestException('Shift user is required');
    if (Number.isNaN(shiftStart.getTime()))
      throw new BadRequestException('Valid shift start time is required');

    const normalizedRole = shiftRole.toLowerCase();
    if (normalizedRole === 'admin') {
      return {
        success: true,
        skipped: true,
        shiftStart: shiftStart.toISOString(),
        sessionId: null,
      };
    }

    const connection = await this.db.getConnection();
    try {
      const [activeSessions] = (await connection.query(
        "SELECT id, loginTime FROM login_logs WHERE user = ? AND status = 'Active' AND logoutTime IS NULL ORDER BY id DESC LIMIT 1",
        [shiftUser],
      )) as [any[], any];

      if (activeSessions.length > 0) {
        return {
          success: true,
          message: 'Active shift session detected',
          sessionId: activeSessions[0].id,
          shiftStart: new Date(activeSessions[0].loginTime).toISOString(),
        };
      }

      const shiftStartSql = toMysqlDateTime(shiftStart);

      const [result] = (await connection.query(
        "INSERT INTO login_logs (user, role, loginTime, logoutTime, status, created_at) VALUES (?, ?, ?, NULL, 'Active', NOW())",
        [shiftUser, shiftRole, shiftStartSql],
      )) as [any, any];

      return {
        success: true,
        message: 'Next shift started successfully',
        sessionId: result.insertId,
        shiftStart: shiftStart.toISOString(),
      };
    } finally {
      connection.release();
    }
  }

  async endShift(body: any) {
    const shiftUser = String(body?.user || '').trim();
    const shiftRole = String(body?.role || 'Staff').trim();
    const shiftSessionId = body?.sessionId ? Number(body.sessionId) : null;
    const recipientEmail = String(
      body?.recipientEmail ||
        process.env.SHIFT_REPORT_EMAIL ||
        process.env.MAIL_USER ||
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        '',
    ).trim();

    const shiftStartRaw = body?.shiftStart;
    const shiftStart = shiftStartRaw ? new Date(shiftStartRaw) : new Date();
    const shiftEnd = new Date();

    if (!shiftUser) throw new BadRequestException('Shift user is required');
    if (Number.isNaN(shiftStart.getTime()))
      throw new BadRequestException('Valid shift start time is required');

    const normalizedRole = shiftRole.toLowerCase();
    if (normalizedRole === 'admin' && !recipientEmail) {
      throw new BadRequestException('Report recipient email is not configured');
    }

    const connection = await this.db.getConnection();
    try {
      let resolvedShiftStart = shiftStart;
      if (normalizedRole === 'admin') {
        const [lastAdminReport] = (await connection.query(
          "SELECT shift_end FROM shift_reports WHERE LOWER(role) = 'admin' AND status = 'Completed' ORDER BY id DESC LIMIT 1",
        )) as [any[], any];
        if (lastAdminReport && lastAdminReport.length > 0) {
          resolvedShiftStart = new Date(lastAdminReport[0].shift_end);
        } else {
          // If no admin report exists, fall back to the oldest login log or 24 hours ago
          const [oldestLog] = (await connection.query(
            'SELECT loginTime FROM login_logs ORDER BY id ASC LIMIT 1',
          )) as [any[], any];
          if (oldestLog && oldestLog.length > 0) {
            resolvedShiftStart = new Date(oldestLog[0].loginTime);
          } else {
            resolvedShiftStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
          }
        }
      }

      const shiftStartSql = toMysqlDateTime(resolvedShiftStart);
      const shiftEndSql = toMysqlDateTime(shiftEnd);

      const [settingsRows] = (await connection.query(
        'SELECT * FROM settings ORDER BY id ASC LIMIT 1',
      )) as [any[], any];
      const shopSettings = settingsRows?.[0] || {};
      const shopName = String(shopSettings.shop || 'Sri Nikil Tradings').trim();

      let billRows: any[];
      if (normalizedRole === 'admin') {
        const [rows] = (await connection.query(
          'SELECT * FROM bills WHERE date BETWEEN ? AND ? ORDER BY date ASC',
          [shiftStartSql, shiftEndSql],
        )) as [any[], any];
        billRows = rows;
      } else {
        const [rows] = (await connection.query(
          'SELECT * FROM bills WHERE by_user = ? AND date BETWEEN ? AND ? ORDER BY date ASC',
          [shiftUser, shiftStartSql, shiftEndSql],
        )) as [any[], any];
        billRows = rows;
      }

      const [productRows] = (await connection.query(
        'SELECT id, name, cat, unit, price, stock, sold, opening_stock FROM products ORDER BY name ASC',
      )) as [any[], any];

      const [refillRows] = (await connection.query(
        'SELECT product, qty, date FROM refills WHERE date BETWEEN ? AND ? ORDER BY date ASC',
        [shiftStartSql, shiftEndSql],
      )) as [any[], any];

      const soldByProductId = new Map();
      let totalItemsSold = 0;
      for (const bill of billRows) {
        const items =
          typeof bill.items === 'string'
            ? JSON.parse(bill.items || '[]')
            : bill.items || [];
        if (!Array.isArray(items)) continue;

        for (const item of items) {
          const productId = Number(item.id);
          const qty = Number(item.qty || 0);
          if (Number.isFinite(productId) && Number.isFinite(qty)) {
            soldByProductId.set(
              productId,
              (soldByProductId.get(productId) || 0) + qty,
            );
            totalItemsSold += qty;
          }
        }
      }

      const refillByProductName = new Map();
      for (const refill of refillRows) {
        const productName = String(refill.product || '').trim();
        const qty = Number(refill.qty || 0);
        if (productName && Number.isFinite(qty)) {
          refillByProductName.set(
            productName,
            (refillByProductName.get(productName) || 0) + qty,
          );
        }
      }

      const products = productRows.map((product: any) => {
        const soldInShift = Number(
          soldByProductId.get(Number(product.id)) || 0,
        );
        const refilledInShift = Number(
          refillByProductName.get(String(product.name || '').trim()) || 0,
        );
        const currentStock = Number(product.stock || 0);
        const estimatedOpeningStock =
          currentStock - refilledInShift + soldInShift;
        const status =
          currentStock === 0
            ? 'Out of Stock'
            : currentStock <= 5
              ? 'Low Stock'
              : 'Healthy';

        return {
          id: Number(product.id),
          name: product.name,
          category: product.cat || '',
          unit: product.unit || '',
          price: Number(product.price || 0),
          openingStock: Number(product.opening_stock || 0),
          estimatedOpeningStock,
          soldInShift,
          refilledInShift,
          currentStock,
          status,
        };
      });

      const remainingStockSummary = {
        totals: {
          totalProducts: products.length,
          healthyCount: products.filter((p: any) => p.status === 'Healthy')
            .length,
          lowStockCount: products.filter((p: any) => p.status === 'Low Stock')
            .length,
          outOfStockCount: products.filter(
            (p: any) => p.status === 'Out of Stock',
          ).length,
        },
        products,
      };

      const paymentBreakdown = billRows.reduce(
        (acc: Record<string, number>, bill: any) => {
          const key = String(bill.payment || 'Unknown').trim() || 'Unknown';
          acc[key] = Number(acc[key] || 0) + Number(bill.grand || 0);
          return acc;
        },
        {},
      );

      const totalShiftSales = billRows.reduce(
        (sum: number, bill: any) => sum + Number(bill.grand || 0),
        0,
      );

      const report = {
        user: shiftUser,
        role: shiftRole,
        shiftStartDisplay: resolvedShiftStart.toLocaleString('en-GB'),
        shiftEndDisplay: shiftEnd.toLocaleString('en-GB'),
        billsCount: billRows.length,
        totalItemsSold,
        totalSalesAmount: totalShiftSales,
        paymentBreakdown,
        remainingStockSummary,
        reportEmail: recipientEmail,
      };

      const friendlyDate = shiftEnd.toLocaleDateString('en-GB');
      const subject = `Shift Report - ${shopName} - ${friendlyDate}`;
      const text = `Hello,\n\nPlease find the attached Shift Report for the completed shift.\n\nRegards,\n${shopName}`;

      let emailStatus = 'skipped';
      let emailError = null;
      let emailSentAtSql: string | null = null;

      if (normalizedRole === 'admin') {
        try {
          // Dynamic require to prevent module crash if exceljs is missing
          /* eslint-disable @typescript-eslint/no-require-imports */
          let generateE;
          try {
            generateE =
              require('../../../utils/excelReportGenerator').generateShiftExcelReport;
          } catch {
            generateE =
              require('../../utils/excelReportGenerator').generateShiftExcelReport;
          }
          /* eslint-enable @typescript-eslint/no-require-imports */
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const nodemailer = require('nodemailer');

          const excelBuffer = await generateE(
            report,
            billRows,
            remainingStockSummary,
          );

          const transporter = nodemailer.createTransport({
            host: String(process.env.SMTP_HOST || '').trim(),
            port: Number(process.env.SMTP_PORT || 587),
            secure:
              String(process.env.SMTP_SECURE || '')
                .trim()
                .toLowerCase() === 'true' ||
              Number(process.env.SMTP_PORT || 587) === 465,
            auth: {
              user: String(
                process.env.SMTP_USER ||
                  process.env.SMTP_SENDER_EMAIL ||
                  process.env.MAIL_USER ||
                  '',
              ).trim(),
              pass: String(
                process.env.SMTP_PASS ||
                  process.env.SMTP_PASSWORD ||
                  process.env.MAIL_APP_PASSWORD ||
                  process.env.MAIL_PASSWORD ||
                  '',
              ).trim(),
            },
          });

          await transporter.sendMail({
            from: String(
              process.env.SMTP_FROM ||
                process.env.MAIL_FROM ||
                process.env.SMTP_USER ||
                process.env.MAIL_USER,
            ).trim(),
            to: recipientEmail,
            subject,
            text,
            attachments: [
              {
                filename: `Shift_Report_${shopName.replace(/\s+/g, '_')}_${friendlyDate.replace(/\//g, '-')}.xlsx`,
                content: excelBuffer,
                contentType:
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              },
            ],
          });

          emailStatus = 'sent';
          emailSentAtSql = shiftEndSql;
        } catch (err: any) {
          emailStatus = 'failed';
          emailError = err.message || 'Email sending failed';
          console.error('Failed to send admin shift mail:', err);
        }
      }

      await connection.beginTransaction();

      if (Number.isFinite(shiftSessionId)) {
        await connection.query(
          'UPDATE login_logs SET logoutTime = ?, status = ? WHERE id = ?',
          [shiftEndSql, 'Completed', shiftSessionId],
        );
      } else {
        await connection.query(
          'UPDATE login_logs SET logoutTime = ?, status = ? WHERE user = ? AND logoutTime IS NULL ORDER BY id DESC LIMIT 1',
          [shiftEndSql, 'Completed', shiftUser],
        );
      }

      await connection.query(
        'INSERT INTO shift_reports (session_id, user, role, shift_start, shift_end, total_bills, total_items_sold, total_sales_amount, payment_breakdown, remaining_stock_summary, report_email, report_subject, email_status, email_error, email_sent_at, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [
          Number.isFinite(shiftSessionId) ? shiftSessionId : null,
          shiftUser,
          shiftRole,
          shiftStartSql,
          shiftEndSql,
          billRows.length,
          totalItemsSold,
          totalShiftSales,
          JSON.stringify(paymentBreakdown),
          JSON.stringify(remainingStockSummary),
          normalizedRole === 'admin' ? recipientEmail : null,
          normalizedRole === 'admin'
            ? subject
            : 'Shift Completed Automatically on Logout',
          emailStatus,
          emailError,
          emailSentAtSql,
          'Completed',
        ],
      );

      await connection.commit();

      return {
        success: true,
        message:
          normalizedRole === 'admin'
            ? 'Shift closed and report sent successfully'
            : normalizedRole === 'manager'
              ? 'Shift ended successfully'
              : 'Shift completed automatically',
        emailedTo: normalizedRole === 'admin' ? recipientEmail : null,
        shiftStart: resolvedShiftStart.toISOString(),
        shiftEnd: shiftEnd.toISOString(),
        billsCount: billRows.length,
        totalItemsSold,
        totalSales: totalShiftSales,
        paymentBreakdown,
        remainingStockSummary: remainingStockSummary.totals,
        promptNextShift: normalizedRole === 'staff',
      };
    } catch (error: any) {
      await connection.rollback();
      throw new InternalServerErrorException(
        error.message || 'Unable to end shift',
      );
    } finally {
      connection.release();
    }
  }

  async getSettings() {
    const [rows] = await this.db.query(
      'SELECT * FROM settings ORDER BY id ASC LIMIT 1',
    );
    return ((rows as any[])[0] || {}) as unknown;
  }

  async getProducts() {
    const [rows] = await this.db.query(
      'SELECT * FROM products ORDER BY id DESC',
    );
    return rows as unknown;
  }

  async getBills() {
    const [rows] = await this.db.query(
      'SELECT * FROM bills ORDER BY date DESC',
    );
    return rows as unknown;
  }

  async getCustomers() {
    const [rows] = await this.db.query(
      'SELECT * FROM customers ORDER BY id DESC',
    );
    return rows as unknown;
  }

  async getRefills() {
    const [rows] = await this.db.query(
      'SELECT * FROM refills ORDER BY date DESC',
    );
    return rows as unknown;
  }

  async getPriceHistory() {
    const [rows] = await this.db.query(
      'SELECT * FROM price_history ORDER BY date DESC',
    );
    return rows as unknown;
  }

  async getLoginLogs() {
    const [rows] = await this.db.query(
      "SELECT * FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) <> 'admin' ORDER BY id DESC",
    );
    return rows as unknown;
  }

  async getAccounts() {
    const [rows] = await this.db.query(
      'SELECT id, user, role FROM accounts ORDER BY id ASC',
    );
    return rows as unknown;
  }
}
