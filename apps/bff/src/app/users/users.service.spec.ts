import { TCP_REQUEST_MESSAGE, TCP_SERVICES, USER_STATUS } from '@ecosystem/constants';
import { CreateUserRequestDto, TcpClient } from '@ecosystem/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';
import { UsersService } from './users.service';

describe('UsersService - BFF', () => {
  let service: UsersService;
  let userClient: jest.Mocked<TcpClient>;

  beforeEach(async () => {
    userClient = {
      send: jest
        .fn()
        .mockReturnValue(of({ code: 'OK', statusCode: 200, data: 'CREATED' })),
      emit: jest.fn(),
    } as unknown as jest.Mocked<TcpClient>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: TCP_SERVICES.AUTH_SERVICE,
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
    it('should send create message to auth service', async () => {
      const createUserDto: CreateUserRequestDto = {
        username: 'tuyennh',
        email: 'new@example.com',
        password: 'StrongPassword123!',
        firstName: 'Test',
        lastName: 'User',
        status: USER_STATUS.ACTIVE,
      };

      const result = await firstValueFrom(service.create(createUserDto));

      expect(userClient.send).toHaveBeenCalledWith(
        TCP_REQUEST_MESSAGE.USER.CREATE,
        createUserDto,
      );
      expect(result.data).toEqual(
        expect.objectContaining({ data: 'CREATED' }),
      );
    });
  });
});
