import { TCP_REQUEST_MESSAGE, TCP_SERVICES } from '@ecosystem/constants';
import { TcpClient } from '@ecosystem/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';
import { RolesService } from './roles.service';

describe('RolesService - BFF', () => {
  let service: RolesService;
  let authClient: jest.Mocked<TcpClient>;

  beforeEach(async () => {
    authClient = {
      send: jest.fn().mockReturnValue(
        of({ code: 'OK', statusCode: 200, data: { id: 1 } }),
      ),
      emit: jest.fn(),
    } as unknown as jest.Mocked<TcpClient>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: TCP_SERVICES.AUTH_SERVICE, useValue: authClient },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send create message', async () => {
    const body = { name: 'administrator', permissionIds: [1] };

    const result = await firstValueFrom(service.create(body));

    expect(authClient.send).toHaveBeenCalledWith(
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
    await firstValueFrom(service.findAll({ includeInactive: 'true' }));

    expect(authClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.GET_ALL,
      { includeInactive: 'true' },
    );
  });

  it('should send get by id message', async () => {
    await firstValueFrom(service.findOne(1));

    expect(authClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.GET_BY_ID,
      1,
    );
  });

  it('should send update message with id in payload', async () => {
    await firstValueFrom(service.update(1, { name: 'admin' }));

    expect(authClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.UPDATE,
      { id: 1, name: 'admin' },
    );
  });

  it('should send delete message', async () => {
    await firstValueFrom(service.remove(1));

    expect(authClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.DELETE,
      1,
    );
  });

  it('should send set permissions message', async () => {
    await firstValueFrom(service.setPermissions(1, { permissionIds: [1, 2] }));

    expect(authClient.send).toHaveBeenCalledWith(
      TCP_REQUEST_MESSAGE.ROLE.SET_PERMISSIONS,
      { roleId: 1, permissionIds: [1, 2] },
    );
  });
});
