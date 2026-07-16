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
exports.ApiService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database.service");
const utils_1 = require("../utils");
function toMysqlDateTime(value) {
    const parsed = value ? new Date(value) : new Date();
    if (Number.isNaN(parsed.getTime())) {
        const now = new Date();
        return now.toLocaleString('sv').replace('T', ' ').slice(0, 19);
    }
    return parsed.toLocaleString('sv').replace('T', ' ').slice(0, 19);
}
function parseItems(rawItems) {
    if (Array.isArray(rawItems))
        return rawItems;
    if (typeof rawItems === 'string') {
        try {
            const parsed = JSON.parse(rawItems);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    return [];
}
const RESET_BACKUP_TABLE = 'data_reset_backups';
const RESET_BACKUP_TABLES = [
    'products',
    'bills',
    'bill_items',
    'customers',
    'sales',
    'transactions',
    'shift_sales',
    'sales_summaries',
    'sales_reports',
    'shift_reports',
];
let ApiService = class ApiService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getNextBillNo(connection) {
        const [rows] = await connection.query("SELECT billNo FROM bills WHERE billNo LIKE 'SNT-%' ORDER BY CAST(SUBSTRING_INDEX(billNo, '-', -1) AS UNSIGNED) DESC LIMIT 1");
        const current = rows?.[0]?.billNo || '';
        const match = String(current).match(/SNT-(\d+)/i);
        const seq = match ? Number(match[1]) + 1 : 1000;
        return `SNT-${String(seq).padStart(4, '0')}`;
    }
    async createBill(body) {
        const { billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, items, by_user, } = body;
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const saleDate = toMysqlDateTime(date);
            if (!Array.isArray(items) || items.length === 0) {
                throw new common_1.BadRequestException('At least one bill item is required');
            }
            const requestedQtyByProductId = new Map();
            for (const item of items) {
                const productId = Number(item.id);
                const qty = Number(item.qty || 0);
                if (!Number.isFinite(productId) || !Number.isFinite(qty) || qty <= 0) {
                    throw new common_1.BadRequestException('Every bill item must have a valid product and positive quantity');
                }
                requestedQtyByProductId.set(productId, (requestedQtyByProductId.get(productId) || 0) + qty);
            }
            const productIds = Array.from(requestedQtyByProductId.keys());
            const [stockRows] = (await connection.query('SELECT id, name, stock, sold, opening_stock FROM products WHERE id IN (?) FOR UPDATE', [productIds]));
            const stockByProductId = new Map(stockRows.map((product) => [Number(product.id), product]));
            for (const [productId, requestedQty,] of requestedQtyByProductId.entries()) {
                const product = stockByProductId.get(productId);
                if (!product) {
                    throw new common_1.BadRequestException('Product not found for billing');
                }
                const availableStock = Number(product.stock || 0);
                const openingStock = Number(product.opening_stock || 0);
                const currentSold = Number(product.sold || 0);
                const expectedStock = openingStock - currentSold;
                if (availableStock !== expectedStock || expectedStock < 0) {
                    throw new common_1.BadRequestException('Stock cannot become negative.');
                }
                if (availableStock <= 0) {
                    throw new common_1.BadRequestException(`${product.name} is out of stock.`);
                }
                if (requestedQty > availableStock) {
                    throw new common_1.BadRequestException(`Only ${availableStock} item(s) are available in stock for ${product.name}.`);
                }
            }
            let billNoToUse = String(billNo || '').trim();
            if (!billNoToUse) {
                billNoToUse = await this.getNextBillNo(connection);
            }
            else {
                const [existing] = await connection.query('SELECT id FROM bills WHERE billNo = ? LIMIT 1', [billNoToUse]);
                if (existing.length > 0) {
                    billNoToUse = await this.getNextBillNo(connection);
                }
            }
            const [result] = await connection.query('INSERT INTO bills (billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, items, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())', [
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
            ]);
            for (const [productId, requestedQty,] of requestedQtyByProductId.entries()) {
                const [stockUpdate] = (await connection.query(`UPDATE products
           SET stock = opening_stock - (sold + ?),
               sold = sold + ?
           WHERE id = ?
             AND stock >= ?
             AND opening_stock - (sold + ?) >= 0`, [requestedQty, requestedQty, productId, requestedQty, requestedQty]));
                if (stockUpdate.affectedRows !== 1) {
                    const product = stockByProductId.get(productId);
                    const availableStock = Number(product?.stock || 0);
                    throw new common_1.BadRequestException(`Only ${availableStock} item(s) are available in stock for ${product?.name || 'this product'}.`);
                }
            }
            for (const item of items) {
                await connection.query('INSERT INTO sales (date, billNo, customer, product, qty, amount, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [
                    saleDate,
                    billNoToUse,
                    customer || null,
                    item.name,
                    item.qty,
                    item.total || item.qty * item.price,
                    by_user || null,
                ]);
            }
            if (customer) {
                await connection.query('INSERT INTO customers (`name`, `phone`, `visits`, `total`, `firstVisit`, `lastVisit`) VALUES (?, ?, 1, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `visits` = `visits` + 1, `total` = `total` + VALUES(`total`), `firstVisit` = IFNULL(LEAST(`firstVisit`, VALUES(`firstVisit`)), VALUES(`firstVisit`)), `lastVisit` = IFNULL(GREATEST(`lastVisit`, VALUES(`lastVisit`)), VALUES(`lastVisit`))', [customer, phone || null, grand || 0, saleDate, saleDate]);
            }
            await connection.commit();
            return { id: result.insertId, billNo: billNoToUse };
        }
        catch (error) {
            await connection.rollback();
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Unable to save bill');
        }
        finally {
            connection.release();
        }
    }
    async deleteBill(id) {
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [bills] = await connection.query('SELECT * FROM bills WHERE id = ?', [id]);
            if (bills.length === 0) {
                await connection.rollback();
                throw new common_1.NotFoundException('Bill not found');
            }
            const bill = bills[0];
            const items = typeof bill.items === 'string' ? JSON.parse(bill.items) : bill.items;
            if (Array.isArray(items)) {
                for (const item of items) {
                    const qty = Number(item.qty || 0);
                    const productId = Number(item.id);
                    if (!Number.isFinite(productId) || !Number.isFinite(qty) || qty <= 0)
                        continue;
                    await connection.query(`UPDATE products
             SET stock = opening_stock - GREATEST(0, sold - ?),
                 sold = GREATEST(0, sold - ?)
             WHERE id = ?`, [qty, qty, productId]);
                }
            }
            await connection.query('DELETE FROM bills WHERE id = ?', [id]);
            await connection.query('DELETE FROM sales WHERE billNo = ?', [
                bill.billNo,
            ]);
            await connection.commit();
            return { success: true };
        }
        catch {
            await connection.rollback();
            throw new common_1.InternalServerErrorException('Unable to delete bill');
        }
        finally {
            connection.release();
        }
    }
    async clearBills() {
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [bills] = await connection.query('SELECT items FROM bills');
            const rollbackByProductId = new Map();
            for (const bill of bills) {
                const parsedItems = typeof bill.items === 'string'
                    ? JSON.parse(bill.items || '[]')
                    : bill.items || [];
                if (!Array.isArray(parsedItems))
                    continue;
                for (const item of parsedItems) {
                    const productId = Number(item.id);
                    const qty = Number(item.qty || 0);
                    if (!Number.isFinite(productId) || !Number.isFinite(qty) || qty <= 0)
                        continue;
                    rollbackByProductId.set(productId, (rollbackByProductId.get(productId) || 0) + qty);
                }
            }
            for (const [productId, qty] of rollbackByProductId.entries()) {
                await connection.query(`UPDATE products
           SET stock = opening_stock - GREATEST(0, sold - ?),
               sold = GREATEST(0, sold - ?)
           WHERE id = ?`, [qty, qty, productId]);
            }
            await connection.query('DELETE FROM bills');
            await connection.query('DELETE FROM customers');
            await connection.query('DELETE FROM sales');
            await connection.commit();
            return { success: true };
        }
        catch {
            await connection.rollback();
            throw new common_1.InternalServerErrorException('Unable to clear bills');
        }
        finally {
            connection.release();
        }
    }
    async createRefill(body) {
        const { product, product_id, productId, id, qty, by, by_user, date } = body;
        const requestedProductId = Number(product_id || productId || id || 0);
        const refillQty = Number.parseInt(qty, 10);
        if ((!product && (!Number.isFinite(requestedProductId) || requestedProductId <= 0)) ||
            !Number.isFinite(refillQty) ||
            refillQty <= 0)
            throw new common_1.BadRequestException('Refill quantity must be greater than zero.');
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [productRows] = Number.isFinite(requestedProductId) && requestedProductId > 0
                ? await connection.query('SELECT id, name, price, stock, sold, opening_stock FROM products WHERE id = ? FOR UPDATE', [requestedProductId])
                : await connection.query('SELECT id, name, price, stock, sold, opening_stock FROM products WHERE name = ? FOR UPDATE', [product]);
            if (productRows.length === 0) {
                await connection.rollback();
                throw new common_1.NotFoundException('Product not found for refill');
            }
            const lockedProduct = productRows[0];
            const currentStock = Number(lockedProduct.stock || 0);
            const currentSold = Number(lockedProduct.sold || 0);
            const openingStock = Number(lockedProduct.opening_stock || 0);
            if (currentStock !== openingStock - currentSold || currentStock < 0) {
                throw new common_1.BadRequestException('Stock cannot become negative.');
            }
            const newOpeningStock = openingStock + refillQty;
            const newStock = newOpeningStock - currentSold;
            const [updateResult] = await connection.query('UPDATE products SET opening_stock = ?, stock = ? WHERE id = ?', [newOpeningStock, newStock, lockedProduct.id]);
            if (updateResult.affectedRows === 0) {
                await connection.rollback();
                throw new common_1.NotFoundException('Product not found for refill');
            }
            const [result] = await connection.query('INSERT INTO refills (product_id, product, qty, `by`, date, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [
                lockedProduct.id,
                lockedProduct.name || product,
                refillQty,
                by || by_user || 'system',
                toMysqlDateTime(date),
            ]);
            await connection.commit();
            return { id: result.insertId };
        }
        catch (error) {
            await connection.rollback();
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Unable to save refill');
        }
        finally {
            connection.release();
        }
    }
    async deleteRefill(id) {
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [rows] = await connection.query('SELECT id, product_id, product, qty FROM refills WHERE id = ? LIMIT 1', [id]);
            if (rows.length === 0) {
                await connection.rollback();
                throw new common_1.NotFoundException('Refill record not found');
            }
            const refill = rows[0];
            const refillQty = Number(refill.qty || 0);
            const refillProductId = Number(refill.product_id || 0);
            const [updateResult] = Number.isFinite(refillProductId) && refillProductId > 0
                ? (await connection.query(`UPDATE products
               SET stock = (opening_stock - ?) - sold,
                   opening_stock = opening_stock - ?
               WHERE id = ?
                 AND opening_stock >= ?
                 AND (opening_stock - ?) - sold >= 0`, [refillQty, refillQty, refillProductId, refillQty, refillQty]))
                : (await connection.query(`UPDATE products
               SET stock = (opening_stock - ?) - sold,
                   opening_stock = opening_stock - ?
               WHERE name = ?
                 AND opening_stock >= ?
                 AND (opening_stock - ?) - sold >= 0`, [refillQty, refillQty, refill.product, refillQty, refillQty]));
            if (updateResult.affectedRows !== 1) {
                throw new common_1.BadRequestException('Stock cannot become negative.');
            }
            await connection.query('DELETE FROM refills WHERE id = ?', [id]);
            await connection.commit();
            return { success: true };
        }
        catch (error) {
            await connection.rollback();
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Unable to delete refill');
        }
        finally {
            connection.release();
        }
    }
    async clearRefills() {
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [rows] = (await connection.query('SELECT product_id, product, SUM(qty) AS qty FROM refills GROUP BY product_id, product'));
            for (const refill of rows) {
                const refillQty = Number(refill.qty || 0);
                if (!Number.isFinite(refillQty) || refillQty <= 0)
                    continue;
                const refillProductId = Number(refill.product_id || 0);
                const [updateResult] = Number.isFinite(refillProductId) && refillProductId > 0
                    ? (await connection.query(`UPDATE products
                 SET stock = (opening_stock - ?) - sold,
                     opening_stock = opening_stock - ?
                 WHERE id = ?
                   AND opening_stock >= ?
                   AND (opening_stock - ?) - sold >= 0`, [refillQty, refillQty, refillProductId, refillQty, refillQty]))
                    : (await connection.query(`UPDATE products
                 SET stock = (opening_stock - ?) - sold,
                     opening_stock = opening_stock - ?
                 WHERE name = ?
                   AND opening_stock >= ?
                   AND (opening_stock - ?) - sold >= 0`, [refillQty, refillQty, refill.product, refillQty, refillQty]));
                if (updateResult.affectedRows !== 1) {
                    throw new common_1.BadRequestException(`Stock cannot become negative for ${refill.product}.`);
                }
            }
            await connection.query('DELETE FROM refills');
            await connection.commit();
            return { success: true };
        }
        catch (error) {
            await connection.rollback();
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Unable to clear refills');
        }
        finally {
            connection.release();
        }
    }
    async syncOpeningStock() {
        await this.db.query('UPDATE products SET opening_stock = 0, sold = 0, stock = 0');
        return { success: true };
    }
    async repairStock() {
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [products] = (await connection.query('SELECT id, code, name, opening_stock FROM products FOR UPDATE'));
            const [bills] = (await connection.query('SELECT id, billNo, items FROM bills'));
            const [refills] = (await connection.query('SELECT product_id, product, qty FROM refills'));
            const [duplicateBills] = (await connection.query('SELECT billNo, COUNT(*) AS count FROM bills GROUP BY billNo HAVING COUNT(*) > 1'));
            const [duplicateRefills] = (await connection.query('SELECT product, qty, date, `by`, COUNT(*) AS count FROM refills GROUP BY product, qty, date, `by` HAVING COUNT(*) > 1'));
            const soldByProductId = new Map();
            for (const bill of bills) {
                const items = parseItems(bill.items);
                for (const item of items) {
                    const productId = Number(item.id);
                    const qty = Number(item.qty || 0);
                    if (!Number.isFinite(productId) || !Number.isFinite(qty) || qty <= 0)
                        continue;
                    soldByProductId.set(productId, (soldByProductId.get(productId) || 0) + qty);
                }
            }
            const refillByProductId = new Map();
            const refillByProductName = new Map();
            for (const refill of refills) {
                const productId = Number(refill.product_id || 0);
                const productName = String(refill.product || '').trim();
                const qty = Number(refill.qty || 0);
                if (!Number.isFinite(qty) || qty <= 0)
                    continue;
                if (Number.isFinite(productId) && productId > 0) {
                    refillByProductId.set(productId, (refillByProductId.get(productId) || 0) + qty);
                }
                else if (productName) {
                    refillByProductName.set(productName, (refillByProductName.get(productName) || 0) + qty);
                }
            }
            const invalidProducts = [];
            let repairedProducts = 0;
            for (const product of products) {
                const soldQty = Number(soldByProductId.get(Number(product.id)) || 0);
                const currentOpeningStock = Number(product.opening_stock || 0);
                const refillStock = Number(refillByProductId.get(Number(product.id)) ||
                    refillByProductName.get(String(product.name || '').trim()) ||
                    0);
                const openingStock = Math.max(currentOpeningStock, refillStock);
                const nextStock = openingStock - soldQty;
                if (nextStock < 0) {
                    invalidProducts.push({
                        id: product.id,
                        code: product.code,
                        name: product.name,
                        openingStock,
                        sold: soldQty,
                        currentStock: nextStock,
                    });
                    continue;
                }
                const [result] = (await connection.query('UPDATE products SET opening_stock = ?, sold = ?, stock = ? WHERE id = ?', [openingStock, soldQty, nextStock, product.id]));
                repairedProducts += result.affectedRows || 0;
            }
            await connection.commit();
            return {
                success: invalidProducts.length === 0,
                repairedProducts,
                invalidProducts,
                duplicateBills,
                duplicateRefills,
            };
        }
        catch (error) {
            await connection.rollback();
            throw new common_1.InternalServerErrorException('Unable to repair stock');
        }
        finally {
            connection.release();
        }
    }
    async createPriceHistory(body) {
        const { product, old, new: newPrice, by, date } = body;
        const [result] = await this.db.query('INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [product, old, newPrice, by || 'system', date || new Date()]);
        return { id: result.insertId };
    }
    async deletePriceHistory(id) {
        const [result] = await this.db.query('DELETE FROM price_history WHERE id = ?', [id]);
        if (result.affectedRows === 0)
            throw new common_1.NotFoundException('Price history entry not found');
        return { success: true };
    }
    async clearPriceHistory() {
        await this.db.query('DELETE FROM price_history');
        return { success: true };
    }
    async updateProductPrice(id, body) {
        const newPrice = Number(body?.new_price);
        const byUser = body?.by_user || 'system';
        if (!Number.isFinite(newPrice) || newPrice < 0)
            throw new common_1.BadRequestException('Valid new price is required');
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [products] = await connection.query('SELECT name, price FROM products WHERE id = ? LIMIT 1', [id]);
            if (products.length === 0) {
                await connection.rollback();
                throw new common_1.NotFoundException('Product not found');
            }
            const product = products[0];
            const oldPrice = Number(product.price || 0);
            await connection.query('UPDATE products SET price = ? WHERE id = ?', [
                newPrice,
                id,
            ]);
            await connection.query('INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [product.name, oldPrice, newPrice, byUser, toMysqlDateTime(body?.date)]);
            await connection.commit();
            return { success: true };
        }
        catch {
            await connection.rollback();
            throw new common_1.InternalServerErrorException('Unable to update product price');
        }
        finally {
            connection.release();
        }
    }
    async createProduct(body) {
        const { code, name, cat, unit, price, stock, image } = body;
        const initialStock = Number(stock || 0);
        if (!Number.isFinite(initialStock) || initialStock < 0) {
            throw new common_1.BadRequestException('Initial stock must be zero or greater');
        }
        const [result] = await this.db.query('INSERT INTO products (code, name, cat, unit, price, stock, sold, opening_stock, image, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, NOW())', [code, name, cat, unit, price, initialStock, initialStock, image]);
        return { id: result.insertId };
    }
    async deleteProduct(id) {
        await this.db.query('DELETE FROM products WHERE id = ?', [id]);
        return { success: true };
    }
    async createAccount(body) {
        const { user, password, role } = body;
        const hashedPassword = (0, utils_1.hashPassword)(password || '');
        const [result] = await this.db.query('INSERT INTO accounts (user, pass, role, created_at) VALUES (?, ?, ?, NOW())', [user, hashedPassword, role || 'Staff']);
        return { id: result.insertId };
    }
    async updateAccountPassword(username, body) {
        const nextPassword = String(body?.password || '');
        if (!username || !nextPassword)
            throw new common_1.BadRequestException('Username and password are required');
        const hashedPassword = (0, utils_1.hashPassword)(nextPassword);
        const [result] = await this.db.query('UPDATE accounts SET pass = ? WHERE user = ?', [hashedPassword, username]);
        if (result.affectedRows === 0)
            throw new common_1.NotFoundException('Account not found');
        return { success: true };
    }
    async deleteAccount(username) {
        await this.db.query('DELETE FROM accounts WHERE user = ?', [username]);
        return { success: true };
    }
    async clearCustomers() {
        await this.db.query('DELETE FROM customers');
        return { success: true };
    }
    async resetSalesData() {
        await this.db.query(`CREATE TABLE IF NOT EXISTS \`${RESET_BACKUP_TABLE}\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`reason\` VARCHAR(255) NOT NULL,
        \`payload\` LONGTEXT NOT NULL
      ) ENGINE=InnoDB`);
        const connection = await this.db.getConnection();
        try {
            await connection.beginTransaction();
            const [existingTableRows] = (await connection.query(`SELECT TABLE_NAME
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME IN (?)`, [RESET_BACKUP_TABLES]));
            const existingTables = new Set(existingTableRows.map((row) => String(row.TABLE_NAME)));
            const backup = {};
            for (const tableName of RESET_BACKUP_TABLES) {
                if (!existingTables.has(tableName))
                    continue;
                const [rows] = (await connection.query(`SELECT * FROM \`${tableName}\``));
                backup[tableName] = rows;
            }
            const [backupResult] = (await connection.query(`INSERT INTO \`${RESET_BACKUP_TABLE}\` (reason, payload, created_at) VALUES (?, ?, NOW())`, [
                'sales-data-reset',
                JSON.stringify({
                    createdAt: new Date().toISOString(),
                    tables: backup,
                }),
            ]));
            const deleteTables = [
                'bill_items',
                'bills',
                'customers',
                'sales',
                'transactions',
                'shift_sales',
                'sales_summaries',
                'sales_reports',
                'shift_reports',
            ];
            for (const tableName of deleteTables) {
                if (!existingTables.has(tableName))
                    continue;
                await connection.query(`DELETE FROM \`${tableName}\``);
            }
            await connection.query(`UPDATE products
         SET
           opening_stock = 0,
           stock = 0,
           sold = 0`);
            await connection.commit();
            return {
                success: true,
                backupId: backupResult.insertId,
                message: 'Sales data reset successfully',
            };
        }
        catch (error) {
            await connection.rollback();
            throw new common_1.InternalServerErrorException(error.message || 'Unable to reset sales data');
        }
        finally {
            connection.release();
        }
    }
    async createLoginLog(body) {
        const { user_name, role } = body;
        const normalizedRole = String(role || '')
            .trim()
            .toLowerCase();
        if (normalizedRole === 'admin')
            return { skipped: true };
        const [result] = await this.db.query('INSERT INTO login_logs (user, role, loginTime, created_at) VALUES (?, ?, NOW(), NOW())', [user_name, role]);
        return { id: result.insertId };
    }
    async logout(id) {
        await this.db.query("UPDATE login_logs SET logoutTime = NOW(), status = 'Completed' WHERE id = ?", [id]);
        return { success: true };
    }
    async deleteLoginLog(id) {
        await this.db.query('DELETE FROM login_logs WHERE id = ?', [id]);
        return { success: true };
    }
    async clearLoginLogs() {
        await this.db.query('DELETE FROM login_logs');
        return { success: true };
    }
    async updateSettings(body) {
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
    async startShift(body) {
        const shiftUser = String(body?.user || '').trim();
        const shiftRole = String(body?.role || 'Staff').trim();
        const shiftStart = body?.shiftStart
            ? new Date(body.shiftStart)
            : new Date();
        if (!shiftUser)
            throw new common_1.BadRequestException('Shift user is required');
        if (Number.isNaN(shiftStart.getTime()))
            throw new common_1.BadRequestException('Valid shift start time is required');
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
            const [activeSessions] = (await connection.query("SELECT id, loginTime FROM login_logs WHERE user = ? AND status = 'Active' AND logoutTime IS NULL ORDER BY id DESC LIMIT 1", [shiftUser]));
            if (activeSessions.length > 0) {
                return {
                    success: true,
                    message: 'Active shift session detected',
                    sessionId: activeSessions[0].id,
                    shiftStart: new Date(activeSessions[0].loginTime).toISOString(),
                };
            }
            const shiftStartSql = toMysqlDateTime(shiftStart);
            const [result] = (await connection.query("INSERT INTO login_logs (user, role, loginTime, logoutTime, status, created_at) VALUES (?, ?, ?, NULL, 'Active', NOW())", [shiftUser, shiftRole, shiftStartSql]));
            return {
                success: true,
                message: 'Next shift started successfully',
                sessionId: result.insertId,
                shiftStart: shiftStart.toISOString(),
            };
        }
        finally {
            connection.release();
        }
    }
    async endShift(body) {
        const shiftUser = String(body?.user || '').trim();
        const shiftRole = String(body?.role || 'Staff').trim();
        const shiftSessionId = body?.sessionId ? Number(body.sessionId) : null;
        const recipientEmail = String(body?.recipientEmail ||
            process.env.SHIFT_REPORT_EMAIL ||
            process.env.MAIL_USER ||
            process.env.SMTP_FROM ||
            process.env.SMTP_USER ||
            '').trim();
        const shiftStartRaw = body?.shiftStart;
        const shiftStart = shiftStartRaw ? new Date(shiftStartRaw) : new Date();
        const shiftEnd = new Date();
        if (!shiftUser)
            throw new common_1.BadRequestException('Shift user is required');
        if (Number.isNaN(shiftStart.getTime()))
            throw new common_1.BadRequestException('Valid shift start time is required');
        const normalizedRole = shiftRole.toLowerCase();
        if (normalizedRole === 'admin' && !recipientEmail) {
            throw new common_1.BadRequestException('Report recipient email is not configured');
        }
        const connection = await this.db.getConnection();
        try {
            let resolvedShiftStart = shiftStart;
            if (normalizedRole === 'admin') {
                const [lastAdminReport] = (await connection.query("SELECT shift_end FROM shift_reports WHERE LOWER(role) = 'admin' AND status = 'Completed' ORDER BY id DESC LIMIT 1"));
                if (lastAdminReport && lastAdminReport.length > 0) {
                    resolvedShiftStart = new Date(lastAdminReport[0].shift_end);
                }
                else {
                    const [oldestLog] = (await connection.query('SELECT loginTime FROM login_logs ORDER BY id ASC LIMIT 1'));
                    if (oldestLog && oldestLog.length > 0) {
                        resolvedShiftStart = new Date(oldestLog[0].loginTime);
                    }
                    else {
                        resolvedShiftStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    }
                }
            }
            const shiftStartSql = toMysqlDateTime(resolvedShiftStart);
            const shiftEndSql = toMysqlDateTime(shiftEnd);
            const [settingsRows] = (await connection.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1'));
            const shopSettings = settingsRows?.[0] || {};
            const shopName = String(shopSettings.shop || 'Sri Nikil Tradings').trim();
            let billRows;
            if (normalizedRole === 'admin') {
                const [rows] = (await connection.query('SELECT * FROM bills WHERE date BETWEEN ? AND ? ORDER BY date ASC', [shiftStartSql, shiftEndSql]));
                billRows = rows;
            }
            else {
                const [rows] = (await connection.query('SELECT * FROM bills WHERE by_user = ? AND date BETWEEN ? AND ? ORDER BY date ASC', [shiftUser, shiftStartSql, shiftEndSql]));
                billRows = rows;
            }
            const [productRows] = (await connection.query('SELECT id, name, cat, unit, price, stock, sold, opening_stock FROM products ORDER BY name ASC'));
            const [refillRows] = (await connection.query('SELECT product, qty, date FROM refills WHERE date BETWEEN ? AND ? ORDER BY date ASC', [shiftStartSql, shiftEndSql]));
            const soldByProductId = new Map();
            let totalItemsSold = 0;
            for (const bill of billRows) {
                const items = typeof bill.items === 'string'
                    ? JSON.parse(bill.items || '[]')
                    : bill.items || [];
                if (!Array.isArray(items))
                    continue;
                for (const item of items) {
                    const productId = Number(item.id);
                    const qty = Number(item.qty || 0);
                    if (Number.isFinite(productId) && Number.isFinite(qty)) {
                        soldByProductId.set(productId, (soldByProductId.get(productId) || 0) + qty);
                        totalItemsSold += qty;
                    }
                }
            }
            const refillByProductName = new Map();
            for (const refill of refillRows) {
                const productName = String(refill.product || '').trim();
                const qty = Number(refill.qty || 0);
                if (productName && Number.isFinite(qty)) {
                    refillByProductName.set(productName, (refillByProductName.get(productName) || 0) + qty);
                }
            }
            const products = productRows.map((product) => {
                const soldInShift = Number(soldByProductId.get(Number(product.id)) || 0);
                const refilledInShift = Number(refillByProductName.get(String(product.name || '').trim()) || 0);
                const currentStock = Number(product.stock || 0);
                const estimatedOpeningStock = currentStock - refilledInShift + soldInShift;
                const status = currentStock === 0
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
                    healthyCount: products.filter((p) => p.status === 'Healthy')
                        .length,
                    lowStockCount: products.filter((p) => p.status === 'Low Stock')
                        .length,
                    outOfStockCount: products.filter((p) => p.status === 'Out of Stock').length,
                },
                products,
            };
            const paymentBreakdown = billRows.reduce((acc, bill) => {
                const key = String(bill.payment || 'Unknown').trim() || 'Unknown';
                acc[key] = Number(acc[key] || 0) + Number(bill.grand || 0);
                return acc;
            }, {});
            const totalShiftSales = billRows.reduce((sum, bill) => sum + Number(bill.grand || 0), 0);
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
            let emailSentAtSql = null;
            if (normalizedRole === 'admin') {
                try {
                    let generateE;
                    try {
                        generateE =
                            require('../../../utils/excelReportGenerator').generateShiftExcelReport;
                    }
                    catch {
                        generateE =
                            require('../../utils/excelReportGenerator').generateShiftExcelReport;
                    }
                    const nodemailer = require('nodemailer');
                    const excelBuffer = await generateE(report, billRows, remainingStockSummary);
                    const transporter = nodemailer.createTransport({
                        host: String(process.env.SMTP_HOST || '').trim(),
                        port: Number(process.env.SMTP_PORT || 587),
                        secure: String(process.env.SMTP_SECURE || '')
                            .trim()
                            .toLowerCase() === 'true' ||
                            Number(process.env.SMTP_PORT || 587) === 465,
                        auth: {
                            user: String(process.env.SMTP_USER ||
                                process.env.SMTP_SENDER_EMAIL ||
                                process.env.MAIL_USER ||
                                '').trim(),
                            pass: String(process.env.SMTP_PASS ||
                                process.env.SMTP_PASSWORD ||
                                process.env.MAIL_APP_PASSWORD ||
                                process.env.MAIL_PASSWORD ||
                                '').trim(),
                        },
                    });
                    await transporter.sendMail({
                        from: String(process.env.SMTP_FROM ||
                            process.env.MAIL_FROM ||
                            process.env.SMTP_USER ||
                            process.env.MAIL_USER).trim(),
                        to: recipientEmail,
                        subject,
                        text,
                        attachments: [
                            {
                                filename: `Shift_Report_${shopName.replace(/\s+/g, '_')}_${friendlyDate.replace(/\//g, '-')}.xlsx`,
                                content: excelBuffer,
                                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            },
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
            let reportSessionId = null;
            if (Number.isFinite(shiftSessionId)) {
                const [sessionRows] = (await connection.query('SELECT id FROM login_logs WHERE id = ? LIMIT 1', [shiftSessionId]));
                if (sessionRows.length > 0) {
                    reportSessionId = shiftSessionId;
                    await connection.query('UPDATE login_logs SET logoutTime = ?, status = ? WHERE id = ?', [shiftEndSql, 'Completed', shiftSessionId]);
                }
                else {
                    await connection.query('UPDATE login_logs SET logoutTime = ?, status = ? WHERE user = ? AND logoutTime IS NULL ORDER BY id DESC LIMIT 1', [shiftEndSql, 'Completed', shiftUser]);
                }
            }
            else {
                await connection.query('UPDATE login_logs SET logoutTime = ?, status = ? WHERE user = ? AND logoutTime IS NULL ORDER BY id DESC LIMIT 1', [shiftEndSql, 'Completed', shiftUser]);
            }
            await connection.query('INSERT INTO shift_reports (session_id, user, role, shift_start, shift_end, total_bills, total_items_sold, total_sales_amount, payment_breakdown, remaining_stock_summary, report_email, report_subject, email_status, email_error, email_sent_at, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())', [
                reportSessionId,
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
            ]);
            await connection.commit();
            return {
                success: true,
                message: normalizedRole === 'admin'
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
        }
        catch (error) {
            await connection.rollback();
            throw new common_1.InternalServerErrorException(error.message || 'Unable to end shift');
        }
        finally {
            connection.release();
        }
    }
    async getSettings() {
        const [rows] = await this.db.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
        return (rows[0] || {});
    }
    async getProducts() {
        const [rows] = await this.db.query('SELECT * FROM products ORDER BY id DESC');
        return rows;
    }
    async getBills() {
        const [rows] = await this.db.query('SELECT * FROM bills ORDER BY date DESC');
        return rows;
    }
    async getCustomers() {
        const [rows] = await this.db.query('SELECT * FROM customers ORDER BY id DESC');
        return rows;
    }
    async getRefills() {
        const [rows] = await this.db.query('SELECT * FROM refills ORDER BY date DESC');
        return rows;
    }
    async getPriceHistory() {
        const [rows] = await this.db.query('SELECT * FROM price_history ORDER BY date DESC');
        return rows;
    }
    async getLoginLogs() {
        const [rows] = await this.db.query("SELECT * FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) <> 'admin' ORDER BY id DESC");
        return rows;
    }
    async getAccounts() {
        const [rows] = await this.db.query('SELECT id, user, role FROM accounts ORDER BY id ASC');
        return rows;
    }
};
exports.ApiService = ApiService;
exports.ApiService = ApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ApiService);
//# sourceMappingURL=api.service.js.map