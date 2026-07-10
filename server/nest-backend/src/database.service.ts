import { Injectable, Inject } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async query(sql: string, values?: any[]): Promise<any> {
    const [rows, fields] = await this.pool.query(sql, values);
    return [rows, fields];
  }

  async getConnection() {
    return this.pool.getConnection();
  }
}
