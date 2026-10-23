import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { Prisma } from '../../generated/prisma/client';
import { CreateUserRequestDto } from '@ecosystem/interfaces';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository
  ) {}


  async create(data: CreateUserRequestDto) {
    const isExists = await this.userRepository.checkEmailExists(data.email);
    if (isExists) {
      throw new BadRequestException(
        'This email is already registered. Please use another email or login.'
      );
    }
    return this.userRepository.create(data);
  }

  getUsers() {
    return this.userRepository.getUsers();
  }

  // async getUser(data: Prisma.UserWhereUniqueInput): Promise<> {
  //   return this.userRepository.getUser(args);
  // }

  getUserByUserId(id: string) {
    return this.userRepository.getByUserId(id)
  }

  getUserByKeycloakId(keycloak_id: string) {
    return this.userRepository.getUserByKeycloakId(keycloak_id)
  }
}
