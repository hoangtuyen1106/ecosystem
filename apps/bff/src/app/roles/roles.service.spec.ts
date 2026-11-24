import {
  PERMISSION,
  ROLE_STATUS,
  TCP_REQUEST_MESSAGE,
  TCP_SERVICES,
} from '@ecosystem/constants';
import { TcpClient } from '@ecosystem/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';
import { RolesService } from './roles.service';

describe('RolesService - BFF', () => {
  let service: RolesService;
  let userAccessClient: jest.Mocked<TcpClient>;

  beforeEach(async () => {
    userAccessClient = {
      send: jest.fn().mockReturnValue(
        of({ code: 'OK', statusCode: 200, data: { id: 1 } }),
      ),
      emit: jest.fn(),
    } as unknown as jest.Mocked<TcpClient>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: TCP_SERVICES.USER_ACCESS_SERVICE, useValue: userAccessClient },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send create message', async () => {
    const body = {
      name: 'administrator',
      permissions: [PERMISSION.ROLE_CREATE],
    };

    const result = await firstValueFrom(service.create(body));

    expect(userAccessClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.CREATE,
      body,
    );
    expect(result.data).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({ id: 1 }),
      }),
    );
  });

  it('should send get all message', async () => {
    await firstValueFrom(service.findAll({ status: [ROLE_STATUS.ACTIVE] }));

    expect(userAccessClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.GET_ALL,
      { status: [ROLE_STATUS.ACTIVE] },
    );
  });

  it('should send get by id message', async () => {
    await firstValueFrom(service.findOne(1));

    expect(userAccessClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.GET_BY_ID,
      1,
    );
  });

  it('should format dates in Asia/Ho_Chi_Minh timezone', async () => {
    userAccessClient.send.mockReturnValueOnce(
      of({
        code: 'OK',
        statusCode: 200,
        data: {
          id: 1,
          createdAt: '2026-11-13T17:22:35.000Z',
          updatedAt: '2026-11-13T18:03:39.438Z',
        },
      }),
    );

    const result = await firstValueFrom(service.findOne(1));

    expect(result.data).toEqual(
      expect.objectContaining({
        data: {
          id: 1,
          createdAt: '14/11/2026 00:22:35',
          updatedAt: '14/11/2026 01:03:39',
        },
      }),
    );
  });

  it('should format dates in nested arrays', async () => {
    userAccessClient.send.mockReturnValueOnce(
      of({
        code: 'OK',
        statusCode: 200,
        data: [
          { id: 1, createdAt: '2026-11-13T17:22:35.000Z' },
          { id: 2, createdAt: null },
        ],
      }),
    );

    const result = await firstValueFrom(service.findAll());

    expect(result.data).toEqual(
      expect.objectContaining({
        data: [
          { id: 1, createdAt: '14/11/2026 00:22:35' },
          { id: 2, createdAt: null },
        ],
      }),
    );
  });

  it('should send update message with id in payload', async () => {
    await firstValueFrom(service.update(1, { name: 'admin' }));

    expect(userAccessClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.UPDATE,
      { id: 1, name: 'admin' },
    );
  });

  it('should send delete message', async () => {
    await firstValueFrom(service.remove(1));

    expect(userAccessClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.DELETE,
      1,
    );
  });

  it('should send change status message', async () => {
    await firstValueFrom(service.changeStatus(1, { status: ROLE_STATUS.INACTIVE }));

    expect(userAccessClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.CHANGE_STATUS,
      { id: 1, status: ROLE_STATUS.INACTIVE },
    );
  });

  it('should send set permissions message', async () => {
    await firstValueFrom(
      service.setPermissions(1, {
        permissions: [PERMISSION.ROLE_CREATE, PERMISSION.ROLE_UPDATE],
      }),
    );

    expect(userAccessClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.SET_PERMISSIONS,
      {
        roleId: 1,
        permissions: [PERMISSION.ROLE_CREATE, PERMISSION.ROLE_UPDATE],
      },
    );
  });
});
