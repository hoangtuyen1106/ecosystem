import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { throwError } from 'rxjs';
import { TCP_SERVICES } from '@ecosystem/configuration';
import { CreateUserRequestDto, ResponseDto, TcpClient } from '@ecosystem/interfaces';
import { USER_STATUS } from '@ecosystem/constants';
import { UsersService } from './users.service';

describe('UsersService - BFF', () => {
  let service: UsersService;
  let userClient: jest.Mocked<TcpClient>;

  beforeEach(async () => {
    userClient = {
      send: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: TCP_SERVICES.TCP_USER_SERVICE,
          useValue: userClient,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException when auth service returns duplicate email error', (done) => {
      const createUserDto: CreateUserRequestDto = {
        email: 'duplicate@example.com',
        password: 'StrongPassword123!',
        firstName: 'Test',
        status: USER_STATUS.ACTIVE,
      };

      const error = new Error('This email is already registered. Please use another email or login.');
      userClient.send.mockReturnValue(throwError(() => error));

      service.create(createUserDto).subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toContain('This email is already registered');
          done();
        },
      });
    });

    it('should throw BadRequestException with fallback message if error has no message', (done) => {
      const createUserDto: CreateUserRequestDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        firstName: 'Test',
        status: USER_STATUS.ACTIVE,
      };

      const error = new Error();
      userClient.send.mockReturnValue(throwError(() => error));

      service.create(createUserDto).subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toBe('Failed to create user');
          done();
        },
      });
    });
  });
});
