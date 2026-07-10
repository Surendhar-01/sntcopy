import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';

@Injectable()
export class DbService {
  constructor(private readonly db: DatabaseService) {}

  async getAllData() {
    // Fetch all data from tables in parallel
    const [
      [products],
      [bills],
      [users],
      [customers],
      [sales],
      [refills],
      [priceHistory],
      [accounts],
      [settings],
      [loginLogs],
    ] = await Promise.all([
      this.db.query('SELECT * FROM products ORDER BY id DESC'),
      this.db.query('SELECT * FROM bills ORDER BY date DESC'),
      this.db.query('SELECT * FROM users'),
      this.db.query('SELECT * FROM customers ORDER BY id DESC'),
      this.db.query('SELECT * FROM sales ORDER BY date DESC'),
      this.db.query('SELECT * FROM refills ORDER BY date DESC'),
      this.db.query('SELECT * FROM price_history ORDER BY date DESC'),
      this.db.query('SELECT id, user, role FROM accounts ORDER BY id ASC'),
      this.db.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1'),
      this.db.query(
        "SELECT * FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) <> 'admin' ORDER BY id DESC",
      ),
    ]);

    return {
      products,
      bills,
      users,
      customers,
      sales,
      refills,
      priceHistory,
      accounts,
      settings: settings?.[0] || {},
      loginLogs,
    };
  }
}
