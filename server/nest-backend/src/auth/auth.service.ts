import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { hashPassword, verifyPassword } from '../utils';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async login(username?: string, password?: string) {
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const [rows] = await this.db.query(
      'SELECT id, user, pass, role FROM accounts WHERE LOWER(TRIM(user)) = LOWER(TRIM(?)) LIMIT 1',
      [username],
    );

    if (!rows.length) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const account = rows[0];
    if (!verifyPassword(password, account.pass)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!account.pass.startsWith('scrypt$')) {
      const updatedHash = hashPassword(password);
      await this.db.query('UPDATE accounts SET pass = ? WHERE id = ?', [
        updatedHash,
        account.id,
      ]);
    }

    return { user: account.user, role: account.role };
  }
}
