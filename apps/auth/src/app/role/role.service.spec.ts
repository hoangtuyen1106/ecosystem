import { PERMISSION } from '@ecosystem/constants';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepository } from './repositories/role.repository';
import { RoleService } from './role.service';

type RoleEntity = NonNullable<Awaited<ReturnType<RoleRepository['findById']>>>;

const roleEntity = {
  id: 1,
  name: 'administrator',
  description: 'Admin',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  permissions: [PERMISSION.ROLE_CREATE],
};

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: jest.Mocked<RoleRepository>;

  beforeEach(async () => {
    roleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      setPermissions: jest.fn(),
      softDelete: jest.fn(),
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
    roleRepository.create.mockResolvedValue(roleEntity as RoleEntity);

    const result = await service.create({
      name: 'administrator',
      permissions: [PERMISSION.ROLE_CREATE],
    });

    expect(roleRepository.create).toHaveBeenCalledWith({
      name: 'administrator',
      permissions: [PERMISSION.ROLE_CREATE],
    });
    expect(result.permissions).toEqual([PERMISSION.ROLE_CREATE]);
  });

  it('should map duplicate name (P2002) to BadRequestException', async () => {
    roleRepository.create.mockRejectedValue({ code: 'P2002' });

    await expect(service.create({ name: 'administrator' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when role does not exist', async () => {
    roleRepository.findById.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a role and replace permissions', async () => {
    roleRepository.update.mockResolvedValue(roleEntity as RoleEntity);

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

  it('should soft delete a role', async () => {
    roleRepository.softDelete.mockResolvedValue(roleEntity as RoleEntity);

    await service.remove(1);

    expect(roleRepository.softDelete).toHaveBeenCalledWith(1);
  });

  it('should map missing role on delete (P2025) to NotFoundException', async () => {
    roleRepository.softDelete.mockRejectedValue({ code: 'P2025' });

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('should set permissions for a role', async () => {
    roleRepository.findById.mockResolvedValue(roleEntity as RoleEntity);
    roleRepository.setPermissions.mockResolvedValue(roleEntity as RoleEntity);

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
    roleRepository.findById.mockResolvedValue(null);

    await expect(
      service.setPermissions({ roleId: 1, permissions: [] }),
    ).rejects.toThrow(NotFoundException);
    expect(roleRepository.setPermissions).not.toHaveBeenCalled();
  });
});
