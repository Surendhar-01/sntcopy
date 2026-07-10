import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database.module';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [DatabaseModule, AuthModule, DbModule, ApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
