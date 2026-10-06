import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { Prisma } from '../../generated/prisma/client';
import { CreateUserInput } from '@ecosystem/interfaces';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async createUser(data: CreateUserInput) {
    const isExists = await this.userRepository.checkEmailExists(data.email);
    if (isExists) {
      throw new BadRequestException('user already exists');
    }
    return this.userRepository.create(data);
  }

  getUsers() {
    return this.userRepository.getUsers();
  }

  async getUser(args: Prisma.UserWhereUniqueInput) {
    return this.userRepository.getUser(args);
  }
}
