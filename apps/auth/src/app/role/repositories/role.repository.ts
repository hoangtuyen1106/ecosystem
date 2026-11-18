import {
  FULL_INFO,
  INFO_TYPE,
  LIST_INFO,
  PERMISSION,
  SIMPLE_INFO,
} from '@ecosystem/constants';
import {
  CreateRoleTcpRequest,
  GetRolesCursorTcpRequest,
  GetRolesOffsetTcpRequest,
  GetRolesQueryDto,
  UpdateRoleData,
} from '@ecosystem/interfaces';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllRole(query: GetRolesOffsetTcpRequest) {
    const { page = 1, limit = 10 } = query;

    const { where, orderBy, select } = this.buildQuery(query);

    // Phân trang
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.prismaService.role.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select,
      }),
      this.prismaService.role.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems: totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Dựng phần query dùng chung cho cả phân trang offset và cursor
  private buildQuery(query: GetRolesQueryDto) {
    const {
      sortBy = 'id',
      sortOrder = 'ASC',
      getUser = true,
      field = SIMPLE_INFO,
    } = query;

    return {
      where: this.buildWhere(query),
      orderBy: this.buildOrderBy(sortBy, sortOrder),
      select: this.buildSelect(field, getUser),
    };
  }

  private buildWhere(query: GetRolesQueryDto): Prisma.RoleWhereInput {
    const { search, isActive } = query;

    const where: Prisma.RoleWhereInput = {};

    // Search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.active = isActive;
    }

    return where;
  }

  // ========== ORDER BY ==========
  private buildOrderBy(
    sortBy: string,
    sortOrder: string,
  ): Prisma.RoleOrderByWithRelationInput[] {
    const SORTABLE_FIELDS = ['id', 'name', 'createdAt', 'updatedAt'];

    const field = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'id';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const orderBy: Prisma.RoleOrderByWithRelationInput[] = [
      { [field]: direction },
    ];
    // Thêm id làm tie-breaker để thứ tự ổn định và cursor luôn nằm trong orderBy
    if (field !== 'id') {
      orderBy.push({ id: direction });
    }

    return orderBy;
  }

  // ========== SELECT (chọn trường dữ liệu) ==========
  private buildSelect(field: INFO_TYPE, getUser?: boolean): Prisma.RoleSelect {
    const ROLE_SELECT_BY_INFO: Record<INFO_TYPE, Prisma.RoleSelect> = {
      [FULL_INFO]: {
        id: true,
        name: true,
        description: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
      [LIST_INFO]: {
        id: true,
        name: true,
      },
      [SIMPLE_INFO]: {
        id: true,
        name: true,
        description: true,
        active: true,
        updatedAt: true,
        createdBy: true,
      },
    };
    const roleSelect: Prisma.RoleSelect = {
      ...(ROLE_SELECT_BY_INFO[field] ?? ROLE_SELECT_BY_INFO[SIMPLE_INFO]),
    };
    if (getUser) {
      roleSelect.created = {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      };
    }

    return roleSelect;
  }

  create(data: CreateRoleTcpRequest) {
    const { permissions = [], ...roleData } = data;

    return this.prismaService.role.create({
      data: { ...roleData, permissions },
    });
  }

  async findAllCursor(query: GetRolesCursorTcpRequest) {
    const { cursor, take = 10 } = query;

    const { where, orderBy, select } = this.buildQuery(query);

    // Kỹ thuật Peek Ahead: Lấy dư 1 phần tử (take + 1) để xác định hasNextPage mà không cần gọi count()
    const items = await this.prismaService.role.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy,
      select,
    });

    const hasNextPage = items.length > take;
    if (hasNextPage) {
      items.pop(); // Loại bỏ phần tử dư thừa sau khi đã xác nhận còn trang tiếp
    }

    const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

    return {
      items,
      meta: {
        take,
        hasNextPage,
        nextCursor,
      },
    };
  }

  findById(id: number, isActive = false) {
    return this.prismaService.role.findFirst({
      where: { id, ...(isActive ? {} : { active: true }) },
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

export type RoleEntity = NonNullable<
  Awaited<ReturnType<RoleRepository['findById']>>
>;
