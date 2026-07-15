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
        return mysql.createPool({
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
      },
    },
    DatabaseService,
  ],
  exports: ['DATABASE_POOL', DatabaseService],
})
export class DatabaseModule {}
