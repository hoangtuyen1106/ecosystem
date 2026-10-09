import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserRequestDto } from '@ecosystem/interfaces';
import { USER_STATUS } from '@ecosystem/constants';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';

describe('UsersService - Auth App', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    userRepository = {
      checkEmailExists: jest.fn(),
      create: jest.fn(),
      getUsers: jest.fn(),
      getUser: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'new@example.com',
        password: 'StrongPassword123!',
        firstName: 'Test',
        status: USER_STATUS.ACTIVE,
      };

      const createdUser = {
        id: '123',
        username: null,
        email: 'new@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: null,
        avatar: null,
        phone: null,
        birthday: null,
        gender: null,
        status: USER_STATUS.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.checkEmailExists.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(userRepository.checkEmailExists).toHaveBeenCalledWith(createUserDto.email);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'existing@example.com',
        password: 'StrongPassword123!',
        firstName: 'Test',
        status: USER_STATUS.ACTIVE,
      };

      userRepository.checkEmailExists.mockResolvedValue(true);

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createUserDto)).rejects.toThrow(
        'This email is already registered. Please use another email or login.'
      );

      expect(userRepository.checkEmailExists).toHaveBeenCalledWith(createUserDto.email);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
});
