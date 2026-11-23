import { PERMISSION } from '@ecosystem/constants';
import {
  ChangeRoleStatusTcpRequest,
  CreateRoleTcpRequest,
  GetRolesCursorTcpRequest,
  GetRolesOffsetTcpRequest,
  RoleListCursorTcpResponse,
  RoleListOffsetTcpResponse,
  RoleResponseDto,
  SetRolePermissionsTcpRequest,
  UpdateRoleTcpRequest,
} from '@ecosystem/interfaces';
import { Injectable } from '@nestjs/common';
import { mapPrismaError } from '../prisma/prisma-error.util';
import { RoleEntity, RoleRepository } from './repositories/role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(dto: CreateRoleTcpRequest): Promise<RoleResponseDto> {
    try {
      const role = await this.roleRepository.create(dto);
      return this.toRoleResponse(role);
    } catch (error) {
      mapPrismaError(error, 'Role');
    }
  }

  async findAllRole(
    query: GetRolesOffsetTcpRequest,
  ): Promise<RoleListOffsetTcpResponse> {
    const { items, meta } = await this.roleRepository.findAllRole(query);
    return {
      items: items.map((role) => this.toRoleResponse(role)),
      meta,
    };
  }

  async findAllCursor(
    query: GetRolesCursorTcpRequest,
  ): Promise<RoleListCursorTcpResponse> {
    const { items, meta } = await this.roleRepository.findAllCursor(query);
    return {
      items: items.map((role) => this.toRoleResponse(role)),
      meta,
    };
  }

  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne(id);
    return this.toRoleResponse(role);
  }

  async update(dto: UpdateRoleTcpRequest): Promise<RoleResponseDto> {
    const { id, ...data } = dto;

    try {
      const role = await this.roleRepository.update(id, data);
      return this.toRoleResponse(role);
    } catch (error) {
      mapPrismaError(error, 'Role');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.roleRepository.remove(id);
    } catch (error) {
      mapPrismaError(error, 'Role');
    }
  }

  async setPermissions(
    dto: SetRolePermissionsTcpRequest,
  ): Promise<RoleResponseDto> {
    try {
      const updated = await this.roleRepository.setPermissions(
        dto.roleId,
        dto.permissions,
      );
      return this.toRoleResponse(updated);
    } catch (error) {
      mapPrismaError(error, 'Role');
    }
  }

  async changeStatus(
    dto: ChangeRoleStatusTcpRequest,
  ): Promise<RoleResponseDto> {
    try {
      const updated = await this.roleRepository.changeStatus(
        dto.id,
        dto.status,
      );
      return this.toRoleResponse(updated);
    } catch (error) {
      mapPrismaError(error, 'Role');
    }
  }

  private toRoleResponse(role: RoleEntity): RoleResponseDto {
    // LIST_INFO không select description/permissions/createdAt/updatedAt
    const createdAt = role.createdAt?.toISOString();
    const updatedAt = role.updatedAt?.toISOString();

    return {
      id: role.id,
      name: role.name,
      description: role.description ?? undefined,
      status: role.status,
      authorId: role.authorId ?? undefined,
      authorName: role.author?.firstName,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
      permissions: (role.permissions ?? []) as PERMISSION[],
    } as RoleResponseDto;
  }
}
