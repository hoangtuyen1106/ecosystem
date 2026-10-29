import {
  CreateKeycloakUserTcpReq,
  CreateUserRequestDto,
} from '@ecosystem/interfaces';
import { BadRequestException, Injectable } from '@nestjs/common';
import { KeycloakHttpService } from '../keycloak/keycloak-http.service';
import { UserRepository } from './repositories/user.repository';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly keycloakHttpService: KeycloakHttpService,
  ) {}

  async create(params: CreateUserRequestDto) {
    const isExists = await this.userRepository.checkEmailExists(params.email);
    if (isExists) {
      throw new BadRequestException(
        'This email is already registered. Please use another email or login.',
      );
    }
    const keycloakId = await this.createKeycloakUser({
      email: params.email,
      password: params.password,
      firstName: params.firstName,
      lastName: params.lastName,
    });

    return this.userRepository.create({
      id: uuidv7(),
      ...params,
      keycloakId,
    });
  }

  async createKeycloakUser(data: CreateKeycloakUserTcpReq) {
    return await this.keycloakHttpService.createUser(data);
  }

  getUsers() {
    return this.userRepository.getUsers();
  }

  // async getUser(data: Prisma.UserWhereUniqueInput): Promise<> {
  //   return this.userRepository.getUser(args);
  // }

  getUserByUserId(id: string) {
    return this.userRepository.getByUserId(id);
  }

  getUserByKeycloakId(keycloak_id: string) {
    return this.userRepository.getUserByKeycloakId(keycloak_id);
  }
}
