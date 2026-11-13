import {
  CreateRoleTcpRequest,
  GetRolesQueryDto,
  PermissionResponseDto,
  RoleResponseDto,
  SetRolePermissionsTcpRequest,
  UpdateRoleTcpRequest,
} from '@ecosystem/interfaces';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mapPrismaError } from '../prisma/prisma-error.util';
import { RoleRepository } from './repositories/role.repository';

type RoleWithPermissions = NonNullable<
  Awaited<ReturnType<RoleRepository['findById']>>
>;

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(dto: CreateRoleTcpRequest): Promise<RoleResponseDto> {
    await this.assertPermissionsExist(dto.permissionIds);

    try {
      const role = await this.roleRepository.create(dto);
      return this.toRoleResponse(role);
    } catch (error) {
      mapPrismaError(error, 'Role');
    }
  }

  async findAll(query?: GetRolesQueryDto): Promise<RoleResponseDto[]> {
    const includeInactive = query?.includeInactive === 'true';
    const roles = await this.roleRepository.findAll(includeInactive);
    return roles.map((role) => this.toRoleResponse(role, includeInactive));
  }

  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.toRoleResponse(role);
  }

  async update(dto: UpdateRoleTcpRequest): Promise<RoleResponseDto> {
    const { id, ...data } = dto;
    await this.assertPermissionsExist(data.permissionIds);

    try {
      const role = await this.roleRepository.update(id, data);
      return this.toRoleResponse(role);
    } catch (error) {
      mapPrismaError(error, 'Role');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.roleRepository.softDelete(id);
    } catch (error) {
      mapPrismaError(error, 'Role');
    }
  }

  async setPermissions(
    dto: SetRolePermissionsTcpRequest,
  ): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(dto.roleId, true);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.assertPermissionsExist(dto.permissionIds);

    try {
      const updated = await this.roleRepository.setPermissions(
        dto.roleId,
        dto.permissionIds,
      );
      return this.toRoleResponse(updated);
    } catch (error) {
      mapPrismaError(error, 'Role');
    }
  }

  private async assertPermissionsExist(permissionIds?: number[]) {
    if (!permissionIds?.length) {
      return;
    }

    const uniqueIds = [...new Set(permissionIds)];
    const count = await this.roleRepository.countActivePermissions(uniqueIds);

    if (count !== uniqueIds.length) {
      throw new BadRequestException('One or more permissions not found');
    }
  }

  private toRoleResponse(
    role: RoleWithPermissions,
    includeInactive = false,
  ): RoleResponseDto {
    const permissions = role.permissions
      .map((rolePermission) => rolePermission.permission)
      .filter((permission) => includeInactive || permission.active)
      .map<PermissionResponseDto>((permission) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description ?? undefined,
        active: permission.active,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
      }));

    return {
      id: role.id,
      name: role.name,
      description: role.description ?? undefined,
      active: role.active,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions,
    };
  }
}
