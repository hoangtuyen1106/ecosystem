import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/browser';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  private readonly saltRounds = 9;

  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async createUser(data: Prisma.UserCreateInput) {
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
