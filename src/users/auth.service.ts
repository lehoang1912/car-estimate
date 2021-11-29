import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // 1. See if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email in use');
    }

    // 2. Hash the users password
    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    // 3. Create a new user and save it
    const user = await this.usersService.create(email, result);

    // 4. Return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [salt, storedhash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedhash !== hash.toString('hex')) {
      throw new BadRequestException('Bad password');
    }

    return user;
  }
}
