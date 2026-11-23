import { ERROR_CODE, TCP_REQUEST_MESSAGE, TCP_SERVICES, USER_GENDER, USER_STATUS } from '@ecosystem/constants';
import {
  ChangeUserStatusTcpRequest,
  CreateKeycloakUserTcpReq,
  CreateUserRequestDto,
  GetUsersCursorTcpRequest,
  GetUsersOffsetTcpRequest,
  TcpClient,
  UpdateUserTcpRequest,
  UserListCursorTcpResponse,
  UserListOffsetTcpResponse,
  UserResponseDto,
} from '@ecosystem/interfaces';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { v7 as uuidv7 } from 'uuid';
import { mapPrismaError } from '../prisma/prisma-error.util';
import { UserRepository } from './repositories/user.repository';

/**
 * Hình dạng tối thiểu để map response: chấp nhận cả kết quả `findOne`
 * (đủ field + roles) lẫn item của list select (có thể thiếu field).
 */
type UserResponseInput = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  avatar?: string | null;
  phone?: string | null;
  birthday?: string | null;
  gender?: string | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  roles?: { role: { id: number; name: string } }[];
};

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TCP_SERVICES.AUTH_SERVICE) private readonly authorizerClient: TcpClient,
  ) {}

  async create(
    params: CreateUserRequestDto,
    processId: string,
  ): Promise<UserResponseDto> {
    const isExists = await this.userRepository.emailExists(params.email);
    if (isExists) {
      throw new BadRequestException(ERROR_CODE.USER_ALREADY_EXISTS);
    }
    const keycloakId = await this.createKeycloakUser(
      {
        email: params.email,
        password: params.password,
        firstName: params.firstName,
        lastName: params.lastName ?? '',
      },
      processId,
    );

    return this.userRepository.create({
      id: uuidv7(),
      ...params,
      keycloakId,
    });

  }

  async findAllUser(
    query: GetUsersOffsetTcpRequest,
  ): Promise<UserListOffsetTcpResponse> {
    const { items, meta } = await this.userRepository.findAllUser(query);
    return {
      items: items.map((user) => this.toUserResponse(user)),
      meta,
    };
  }

  async findAllCursor(
    query: GetUsersCursorTcpRequest,
  ): Promise<UserListCursorTcpResponse> {
    const { items, meta } = await this.userRepository.findAllCursor(query);
    return {
      items: items.map((user) => this.toUserResponse(user)),
      meta,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne(id);
    return this.toUserResponse(user);
  }

  async update(dto: UpdateUserTcpRequest): Promise<UserResponseDto> {
    const { id, ...data } = dto;

    if (data.email) {
      const emailTaken = await this.userRepository.emailExists(data.email, id);
      if (emailTaken) {
        throw new BadRequestException(
          'This email is already registered. Please use another email or login.',
        );
      }
    }

    try {
      const user = await this.userRepository.update(id, data);
      return this.toUserResponse(user);
    } catch (error) {
      mapPrismaError(error, 'User');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.userRepository.remove(id);
    } catch (error) {
      mapPrismaError(error, 'User');
    }
  }

  async changeStatus(
    dto: ChangeUserStatusTcpRequest,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.changeStatus(dto.id, dto.status);
      return this.toUserResponse(user);
    } catch (error) {
      mapPrismaError(error, 'User');
    }
  }

  createKeycloakUser(data: CreateKeycloakUserTcpReq, processId: string) {
    return firstValueFrom(
      this.authorizerClient
        .send<string>(TCP_REQUEST_MESSAGE.KEYCLOAK.CREATE_USER, {
          data,
          processId,
        })
        .pipe(map((data) => data.data)),
    );
  }

  getUsers() {
    return this.userRepository.getUsers();
  }

  getUserByUserId(id: string) {
    return this.userRepository.getByUserId(id);
  }

  getUserByKeycloakId(keycloak_id: string) {
    return this.userRepository.getUserByKeycloakId(keycloak_id);
  }

  private toUserResponse(user: UserResponseInput): UserResponseDto {
    // LIST_INFO không select dates/roles
    const createdAt = user.createdAt?.toISOString();
    const updatedAt = user.updatedAt?.toISOString();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName ?? undefined,
      avatar: user.avatar ?? undefined,
      phone: user.phone ?? undefined,
      birthday: user.birthday ?? undefined,
      gender: (user.gender ?? undefined) as USER_GENDER | undefined,
      status: user.status as USER_STATUS,
      roleIds: user.roles?.map((item) => item.role.id) ?? [],
      roleNames: user.roles?.map((item) => item.role.name) ?? [],
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    } as UserResponseDto;
  }
}
