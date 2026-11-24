import {
  ERROR_CODE,
  TCP_REQUEST_MESSAGE,
  TCP_SERVICES,
} from '@ecosystem/constants';
import {
  CreateKeycloakUserTcpReq,
  CreateUserRequestDto,
  TcpClient,
} from '@ecosystem/interfaces';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { v7 as uuidv7 } from 'uuid';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TCP_SERVICES.AUTH_SERVICE)
    private readonly authorizerClient: TcpClient,
  ) {}

  async create(params: CreateUserRequestDto) {
    const isExists = await this.userRepository.emailExists(params.email);
    if (isExists) {
      throw new BadRequestException(ERROR_CODE.USER_ALREADY_EXISTS);
    }
    const keycloakId = await this.createKeycloakUser({
      email: params.email,
      password: params.password,
      firstName: params.firstName,
      lastName: params.lastName ?? '',
    });
    
    if (!keycloakId) {
      throw new BadRequestException('khong tao duoc user tren keycloak');
    }

    const user = await this.userRepository.create({
      ...params,
      id: uuidv7(),
      keycloakId,
    });

    return user;
  }

  createKeycloakUser(data: CreateKeycloakUserTcpReq) {
    return firstValueFrom(
      this.authorizerClient
        .send<string>(TCP_REQUEST_MESSAGE.KEYCLOAK.CREATE_USER, {
          data,
        })
        .pipe(map((data) => data.data)),
    );
  }

  getUserByKeycloakId(keycloakId: string) {
    return this.userRepository.getUserByKeycloakId(keycloakId);
  }

  //   return {
  //     id: user.id,
  //     firstName: user.firstName,
  //     lastName: user.lastName ?? undefined,
  //     email: user.email,
  //     keycloakId: user.keycloakId,
  //     roles: user.roles.map(({ role }) => ({
  //       name: role.name,
  //       description: role.description ?? '',
  //       permissions: role.permissions as PERMISSION[],
  //     })),
  //   };
  // }

  // async findAllUser(
  //   query: GetUsersOffsetTcpRequest,
  // ): Promise<UserListOffsetTcpResponse> {
  //   const { items, meta } = await this.userRepository.findAllUser(query);
  //   return {
  //     items: items.map((user) => user),
  //     meta,
  //   };
  // }

  // async findAllCursor(
  //   query: GetUsersCursorTcpRequest,
  // ): Promise<UserListCursorTcpResponse> {
  //   const { items, meta } = await this.userRepository.findAllCursor(query);
  //   return {
  //     items: items.map((user) => user),
  //     meta,
  //   };
  // }

  // async findOne(id: string): Promise<UserResponseDto> {
  //   return await this.userRepository.findOne(id);
  // }

  // async update(dto: UpdateUserTcpRequest): Promise<UserResponseDto> {
  //   const { id, ...data } = dto;

  //   if (data.email) {
  //     const emailTaken = await this.userRepository.emailExists(data.email, id);
  //     if (emailTaken) {
  //       throw new BadRequestException(
  //         'This email is already registered. Please use another email or login.',
  //       );
  //     }
  //   }

  //   try {
  //     const user = await this.userRepository.update(id, data);
  //     return user;
  //   } catch (error) {
  //     mapPrismaError(error, 'User');
  //   }
  // }

  // async remove(id: string): Promise<void> {
  //   try {
  //     await this.userRepository.remove(id);
  //   } catch (error) {
  //     mapPrismaError(error, 'User');
  //   }
  // }

  // async changeStatus(
  //   dto: ChangeUserStatusTcpRequest,
  // ): Promise<UserResponseDto> {
  //   try {
  //     const user = await this.userRepository.changeStatus(dto.id, dto.status);
  //     return user;
  //   } catch (error) {
  //     mapPrismaError(error, 'User');
  //   }
  // }

  // getUsers() {
  //   return this.userRepository.getUsers();
  // }

  // getUserByUserId(id: string) {
  //   return this.userRepository.getByUserId(id);
  // }
}
