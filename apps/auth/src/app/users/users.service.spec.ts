import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserRequestDto } from '@ecosystem/interfaces';
import { USER_STATUS } from '@ecosystem/constants';
import { KeycloakHttpService } from '../keycloak/keycloak-http.service';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';

describe('UsersService - Auth App', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let keycloakHttpService: jest.Mocked<KeycloakHttpService>;

  beforeEach(async () => {
    userRepository = {
      checkEmailExists: jest.fn(),
      create: jest.fn(),
      getUsers: jest.fn(),
      getUser: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    keycloakHttpService = {
      createUser: jest.fn().mockResolvedValue('keycloak-id'),
    } as unknown as jest.Mocked<KeycloakHttpService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: KeycloakHttpService,
          useValue: keycloakHttpService,
        },
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

    it('should create user successfully', async () => {
      const createdUser = {
        id: '123',
        ...createUserDto,
        keycloakId: 'keycloak-id',
        password: 'hashed_password',
        avatar: null,
        phone: null,
        birthday: null,
        gender: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.checkEmailExists.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(createdUser as never);

      const result = await service.create(createUserDto);

      expect(userRepository.checkEmailExists).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createUserDto,
          keycloakId: 'keycloak-id',
        }),
      );
      expect(result).toEqual(createdUser);
    });

    it('should throw BadRequestException when email already exists', async () => {
      userRepository.checkEmailExists.mockResolvedValue(true);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'This email is already registered. Please use another email or login.',
      );

      expect(userRepository.checkEmailExists).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
});
