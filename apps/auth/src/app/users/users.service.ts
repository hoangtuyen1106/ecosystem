import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/browser';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'bcryptjs';
import { v7 as uuidv7 } from 'uuid';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  private readonly saltRounds = 9;

  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async create(data: Prisma.UserCreateInput) {
    const isExists = await this.userRepository.checkEmailExists(data.email);
    if (isExists) {
      throw new BadRequestException('user already exists');
    }
    return this.userRepository.create(data);
  }

  getUsers() {
    return this.userRepository.getUsers();
  }
}
