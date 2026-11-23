import { USER_STATUS } from '@ecosystem/constants';
import {
  CreateUserRequestDto,
  UpdateUserTcpRequest,
} from '@ecosystem/interfaces';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakHttpService } from '../keycloak/keycloak-http.service';
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

describe('UsersService - Auth App', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let keycloakHttpService: jest.Mocked<KeycloakHttpService>;

  beforeEach(async () => {
    userRepository = {
      emailExists: jest.fn(),
      create: jest.fn(),
      findAllUser: jest.fn(),
      findAllCursor: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      changeStatus: jest.fn(),
      getUsers: jest.fn(),
      getUser: jest.fn(),
      getByUserId: jest.fn(),
      getUserByKeycloakId: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    keycloakHttpService = {
      createUser: jest.fn().mockResolvedValue('keycloak-id'),
    } as unknown as jest.Mocked<KeycloakHttpService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: userRepository },
        { provide: KeycloakHttpService, useValue: keycloakHttpService },
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
      status: USER_STATUS.ACTIVE,
    };

    it('should create user and map response', async () => {
      userRepository.emailExists.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(
        userEntity as unknown as Awaited<ReturnType<UserRepository['create']>>,
      );

      const result = await service.create(createUserDto);

      expect(userRepository.emailExists).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createUserDto,
          keycloakId: 'keycloak-id',
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-1',
          username: 'tuyennh',
          status: USER_STATUS.ACTIVE,
          roleIds: [1],
          roleNames: ['administrator'],
        }),
      );
      expect(result.createdAt).toBe(userEntity.createdAt.toISOString());
    });

    it('should throw BadRequestException when email already exists', async () => {
      userRepository.emailExists.mockResolvedValue(true);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  it('should map offset list', async () => {
    userRepository.findAllUser.mockResolvedValue({
      items: [userEntity],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    } as unknown as Awaited<ReturnType<UserRepository['findAllUser']>>);

    const result = await service.findAllUser({});

    expect(result.items[0]).toEqual(
      expect.objectContaining({ id: 'user-1', roleIds: [1] }),
    );
    expect(result.meta.totalItems).toBe(1);
  });

  it('should map cursor list', async () => {
    userRepository.findAllCursor.mockResolvedValue({
      items: [userEntity],
      meta: { take: 10, hasNextPage: false, nextCursor: 'user-1' },
    } as unknown as Awaited<ReturnType<UserRepository['findAllCursor']>>);

    const result = await service.findAllCursor({});

    expect(result.items).toHaveLength(1);
    expect(result.meta.nextCursor).toBe('user-1');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findOne.mockRejectedValue(
      new NotFoundException('Không tìm thấy user'),
    );

    await expect(service.findOne('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('update', () => {
    const updateDto: UpdateUserTcpRequest = {
      id: 'user-1',
      firstName: 'Updated',
    };

    it('should update and map response', async () => {
      userRepository.update.mockResolvedValue(
        userEntity as unknown as Awaited<ReturnType<UserRepository['update']>>,
      );

      const result = await service.update(updateDto);

      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        firstName: 'Updated',
      });
      expect(result.id).toBe('user-1');
    });

    it('should reject email already used by another user', async () => {
      userRepository.emailExists.mockResolvedValue(true);

      await expect(
        service.update({ id: 'user-1', email: 'taken@example.com' }),
      ).rejects.toThrow(BadRequestException);

      expect(userRepository.emailExists).toHaveBeenCalledWith(
        'taken@example.com',
        'user-1',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  it('should soft remove a user', async () => {
    userRepository.remove.mockResolvedValue({ id: 'user-1' });

    await service.remove('user-1');

    expect(userRepository.remove).toHaveBeenCalledWith('user-1');
  });

  it('should map missing user on delete (P2025) to NotFoundException', async () => {
    userRepository.remove.mockRejectedValue({ code: 'P2025' });

    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });

  it('should change user status', async () => {
    userRepository.changeStatus.mockResolvedValue(
      userEntity as unknown as Awaited<
        ReturnType<UserRepository['changeStatus']>
      >,
    );

    const result = await service.changeStatus({
      id: 'user-1',
      status: USER_STATUS.BLOCKED,
    });

    expect(userRepository.changeStatus).toHaveBeenCalledWith(
      'user-1',
      USER_STATUS.BLOCKED,
    );
    expect(result.status).toBe(USER_STATUS.ACTIVE);
  });
});
