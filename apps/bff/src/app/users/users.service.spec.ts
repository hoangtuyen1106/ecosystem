import {
  TCP_REQUEST_MESSAGE,
  TCP_SERVICES,
  USER_STATUS,
} from '@ecosystem/constants';
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
          provide: TCP_SERVICES.USER_ACCESS_SERVICE,
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
        roleIds: [],
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

  it('should send get all message', async () => {
    await firstValueFrom(service.findAll({ status: [USER_STATUS.ACTIVE] }));

    expect(userClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.USER.GET_ALL,
      { status: [USER_STATUS.ACTIVE] },
    );
  });

  it('should send get all cursor message', async () => {
    await firstValueFrom(service.findAllCursor({ take: 5 }));

    expect(userClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.USER.GET_ALL_CURSOR,
      { take: 5 },
    );
  });

  it('should send get by id message with string id', async () => {
    await firstValueFrom(service.findOne('user-1'));

    expect(userClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.USER.GET_BY_ID,
      'user-1',
    );
  });

  it('should format dates in Asia/Ho_Chi_Minh timezone', async () => {
    userClient.send.mockReturnValueOnce(
      of({
        code: 'OK',
        statusCode: 200,
        data: {
          id: 'user-1',
          createdAt: '2026-11-13T17:22:35.000Z',
          updatedAt: '2026-11-13T18:03:39.438Z',
        },
      }),
    );

    const result = await firstValueFrom(service.findOne('user-1'));

    expect(result.data).toEqual(
      expect.objectContaining({
        data: {
          id: 'user-1',
          createdAt: '14/11/2026 00:22:35',
          updatedAt: '14/11/2026 01:03:39',
        },
      }),
    );
  });

  it('should send update message with id in payload', async () => {
    await firstValueFrom(service.update('user-1', { firstName: 'Updated' }));

    expect(userClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.USER.UPDATE,
      { id: 'user-1', firstName: 'Updated' },
    );
  });

  it('should send delete message', async () => {
    await firstValueFrom(service.remove('user-1'));

    expect(userClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.USER.DELETE,
      'user-1',
    );
  });

  it('should send change status message', async () => {
    await firstValueFrom(
      service.changeStatus('user-1', { status: USER_STATUS.BLOCKED }),
    );

    expect(userClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.USER.CHANGE_STATUS,
      { id: 'user-1', status: USER_STATUS.BLOCKED },
    );
  });
});
