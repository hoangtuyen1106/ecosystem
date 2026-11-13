import { PERMISSION } from '@ecosystem/constants';
import { CreateRoleData, UpdateRoleData } from '@ecosystem/interfaces';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateRoleData) {
    const { permissions = [], ...roleData } = data;

    return this.prismaService.role.create({
      data: { ...roleData, permissions },
    });
  }

  findAll(includeInactive = false) {
    return this.prismaService.role.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number, includeInactive = false) {
    return this.prismaService.role.findFirst({
      where: { id, ...(includeInactive ? {} : { active: true }) },
    });
  }

  update(id: number, data: UpdateRoleData) {
    return this.prismaService.role.update({
      where: { id },
      data,
    });
  }

  setPermissions(roleId: number, permissions: PERMISSION[]) {
    return this.prismaService.role.update({
      where: { id: roleId },
      data: { permissions },
    });
  }

  softDelete(id: number) {
    return this.prismaService.role.update({
      where: { id },
      data: { active: false },
    });
  }
}
