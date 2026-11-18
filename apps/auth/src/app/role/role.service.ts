import { PERMISSION } from '@ecosystem/constants';
import {
  CreateRoleTcpRequest,
  GetRolesCursorTcpRequest,
  GetRolesOffsetTcpRequest,
  RoleListCursorTcpResponse,
  RoleListOffsetTcpResponse,
  RoleResponseDto,
  SetRolePermissionsTcpRequest,
  UpdateRoleTcpRequest,
} from '@ecosystem/interfaces';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAllOffset(
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
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
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

  private toRoleResponse(role: RoleEntity): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description ?? undefined,
      active: role.active,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
      permissions: role.permissions as PERMISSION[],
    };
  }
}
