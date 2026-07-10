import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DbService } from './db.service';

@Controller('db')
export class DbController {
  constructor(private readonly dbService: DbService) {}

  @Get()
  async getAllData() {
    try {
      return await this.dbService.getAllData();
    } catch (error) {
      console.error('Error fetching data from DB:', error);
      throw new InternalServerErrorException(
        'Failed to fetch data from database',
      );
    }
  }
}
