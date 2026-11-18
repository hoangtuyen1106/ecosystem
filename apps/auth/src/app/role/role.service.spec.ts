import { PERMISSION, ROLE_STATUS } from '@ecosystem/constants';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepository } from './repositories/role.repository';
import { RoleService } from './role.service';

const roleEntity = {
  id: 1,
  name: 'administrator',
  description: 'Admin',
  status: ROLE_STATUS.ACTIVE,
  authorId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  permissions: [PERMISSION.ROLE_CREATE],
  author: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: null,
  },
};

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: jest.Mocked<RoleRepository>;

  beforeEach(async () => {
    roleRepository = {
      create: jest.fn(),
      findAllRole: jest.fn(),
      findAllCursor: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      setPermissions: jest.fn(),
      changeStatus: jest.fn(),
      existsByName: jest.fn(),
    } as unknown as jest.Mocked<RoleRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: RoleRepository, useValue: roleRepository },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a role with permissions', async () => {
    roleRepository.create.mockResolvedValue(
      roleEntity as unknown as Awaited<ReturnType<RoleRepository['create']>>,
    );

    const result = await service.create({
      name: 'administrator',
      permissions: [PERMISSION.ROLE_CREATE],
    });

    expect(roleRepository.create).toHaveBeenCalledWith({
      name: 'administrator',
      permissions: [PERMISSION.ROLE_CREATE],
    });
    expect(result.permissions).toEqual([PERMISSION.ROLE_CREATE]);
    expect(result.authorName).toBe('Admin');
  });

  it('should map duplicate name (P2002) to BadRequestException', async () => {
    roleRepository.create.mockRejectedValue({ code: 'P2002' });

    await expect(service.create({ name: 'administrator' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should pass through BadRequestException for duplicate name', async () => {
    roleRepository.create.mockRejectedValue(
      new BadRequestException('Tên role "administrator" đã tồn tại'),
    );

    await expect(service.create({ name: 'administrator' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when role does not exist', async () => {
    roleRepository.findOne.mockRejectedValue(
      new NotFoundException('Không tìm thấy role'),
    );

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a role and replace permissions', async () => {
    roleRepository.update.mockResolvedValue(
      roleEntity as unknown as Awaited<ReturnType<RoleRepository['update']>>,
    );

    const result = await service.update({
      id: 1,
      name: 'administrator',
      permissions: [PERMISSION.ROLE_CREATE],
    });

    expect(roleRepository.update).toHaveBeenCalledWith(1, {
      name: 'administrator',
      permissions: [PERMISSION.ROLE_CREATE],
    });
    expect(result.id).toBe(1);
  });

  it('should remove a role', async () => {
    roleRepository.remove.mockResolvedValue(1);

    await service.remove(1);

    expect(roleRepository.remove).toHaveBeenCalledWith(1);
  });

  it('should not pass active to repository update', async () => {
    roleRepository.update.mockResolvedValue(
      roleEntity as unknown as Awaited<ReturnType<RoleRepository['update']>>,
    );

    await service.update({ id: 1, name: 'administrator', description: 'X' });

    expect(roleRepository.update).toHaveBeenCalledWith(1, {
      name: 'administrator',
      description: 'X',
    });
  });

  it('should map missing role on delete (P2025) to NotFoundException', async () => {
    roleRepository.remove.mockRejectedValue({ code: 'P2025' });

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('should set permissions for a role', async () => {
    roleRepository.findOne.mockResolvedValue(
      roleEntity as Awaited<ReturnType<RoleRepository['findOne']>>,
    );
    roleRepository.setPermissions.mockResolvedValue(
      roleEntity as unknown as Awaited<
        ReturnType<RoleRepository['setPermissions']>
      >,
    );

    const result = await service.setPermissions({
      roleId: 1,
      permissions: [PERMISSION.ROLE_CREATE],
    });

    expect(roleRepository.setPermissions).toHaveBeenCalledWith(1, [
      PERMISSION.ROLE_CREATE,
    ]);
    expect(result.permissions).toHaveLength(1);
  });

  it('should throw NotFoundException when setting permissions on missing role', async () => {
    // Repository.setPermissions tự gọi findOne và ném NotFoundException
    roleRepository.setPermissions.mockRejectedValue(
      new NotFoundException('Không tìm thấy role'),
    );

    await expect(
      service.setPermissions({ roleId: 1, permissions: [] }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should change role status', async () => {
    roleRepository.changeStatus.mockResolvedValue(
      roleEntity as unknown as Awaited<
        ReturnType<RoleRepository['changeStatus']>
      >,
    );

    const result = await service.changeStatus({ id: 1, status: ROLE_STATUS.INACTIVE });

    expect(roleRepository.changeStatus).toHaveBeenCalledWith(
      1,
      ROLE_STATUS.INACTIVE,
    );
    expect(result.status).toBe(ROLE_STATUS.ACTIVE);
    expect(result.authorName).toBe('Admin');
  });

  it('should map missing role when changing status (P2025) to NotFoundException', async () => {
    roleRepository.changeStatus.mockRejectedValue({ code: 'P2025' });

    await expect(
      service.changeStatus({ id: 1, status: ROLE_STATUS.INACTIVE }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should omit dates when list select does not include them (LIST_INFO)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, description, permissions, author, ...rest } =
      roleEntity;
    roleRepository.findAllRole.mockResolvedValue({
      items: [rest],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    } as unknown as Awaited<ReturnType<RoleRepository['findAllRole']>>);

    const result = await service.findAllRole({});

    expect(result.items[0].createdAt).toBeUndefined();
    expect(result.items[0].updatedAt).toBeUndefined();
    expect(result.items[0].permissions).toEqual([]);
    expect(result.items[0].authorName).toBeUndefined();
  });
});
