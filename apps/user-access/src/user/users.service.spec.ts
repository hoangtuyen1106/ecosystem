import {
  TCP_REQUEST_MESSAGE,
  TCP_SERVICES,
  USER_STATUS,
} from '@ecosystem/constants';
import { CreateUserRequestDto, Response } from '@ecosystem/interfaces';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';

const userEntity = {
  id: 'user-1',
  username: 'tuyennh',
  email: 'new@example.com',
  firstName: 'Test',
  lastName: 'User',
  avatar: null,
  phone: null,
  birthday: null,
  gender: null,
  status: USER_STATUS.ACTIVE,
  deleted: false,
  keycloakId: 'keycloak-id',
  password: 'hashed_password',
  searchUnicode: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: [{ role: { id: 1, name: 'administrator' } }],
};

describe('UsersService - User Access App', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let authClient: { send: jest.Mock; emit: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      emailExists: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    authClient = {
      send: jest.fn().mockReturnValue(of(Response.success('keycloak-id'))),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: userRepository },
        { provide: TCP_SERVICES.AUTH_SERVICE, useValue: authClient },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserRequestDto = {
      username: 'tuyennh',
      email: 'new@example.com',
      password: 'StrongPassword123!',
      firstName: 'Test',
      lastName: 'User',
      roleIds: [],
      status: USER_STATUS.ACTIVE,
    };

    it('should create user and map response', async () => {
      userRepository.emailExists.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(
        userEntity as unknown as Awaited<ReturnType<UserRepository['create']>>,
      );

      const result = await service.create(createUserDto);

      expect(authClient.send).toHaveBeenCalledWith(
        TCP_REQUEST_MESSAGE.KEYCLOAK.CREATE_USER,
        {
          data: {
            email: createUserDto.email,
            password: createUserDto.password,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
          },
        },
      );
      expect(userRepository.emailExists).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createUserDto,
          keycloakId: 'keycloak-id',
        }),
      );
      // Service hiện trả nguyên kết quả repository (flatten roles ở repo)
      expect(result).toBe(userEntity);
    });

    it('should throw BadRequestException when email already exists', async () => {
      userRepository.emailExists.mockResolvedValue(true);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
});
