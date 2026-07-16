import { Module, Global } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: async () => {
        const dbName = process.env.DB_DATABASE || process.env.DB_NAME || 'erp';
        const dbPort = Number(process.env.DB_PORT || 3306);
        const pool = mysql.createPool({
          host: process.env.DB_HOST || '127.0.0.1',
          user: process.env.DB_USERNAME || process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
          database: dbName,
          port: dbPort,
          ssl:
            process.env.DB_SSL === 'true'
              ? { rejectUnauthorized: false }
              : undefined,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          dateStrings: true,
        });
        const [refillProductIdCols] = (await pool.query(
          'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
          [dbName, 'refills', 'product_id'],
        )) as [any[], any];
        if (refillProductIdCols.length === 0) {
          await pool.query(
            'ALTER TABLE `refills` ADD COLUMN `product_id` INT NULL AFTER `date`',
          );
          await pool.query(
            `UPDATE refills r
             JOIN products p ON p.name = r.product
             SET r.product_id = p.id
             WHERE r.product_id IS NULL`,
          );
        }
        return pool;
      },
    },
    DatabaseService,
  ],
  exports: ['DATABASE_POOL', DatabaseService],
})
export class DatabaseModule {}
