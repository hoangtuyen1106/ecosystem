import {
  FULL_INFO,
  INFO_TYPE,
  LIST_INFO,
  PERMISSION,
  ROLE_STATUS,
  SIMPLE_INFO,
} from '@ecosystem/constants';
import {
  CreateRoleTcpRequest,
  GetRolesCursorTcpRequest,
  GetRolesOffsetTcpRequest,
  GetRolesQueryDto,
  UpdateRoleData,
} from '@ecosystem/interfaces';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StringUtil } from '@ecosystem/utils';

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

  async findAllCursor(query: GetRolesCursorTcpRequest) {
    const { cursor, take = 10 } = query;

    const { where, orderBy, select } = this.buildQuery(query);

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

  // Dựng phần query dùng chung cho cả phân trang offset và cursor
  private buildQuery(query: GetRolesQueryDto) {
    const { sortBy = 'id', sortOrder = 'ASC', field = SIMPLE_INFO } = query;

    return {
      where: this.buildWhere(query),
      orderBy: this.buildOrderBy(sortBy, sortOrder),
      select: this.buildSelect(field),
    };
  }

  private buildWhere(query: GetRolesQueryDto): Prisma.RoleWhereInput {
    const { search, status } = query;

    const where: Prisma.RoleWhereInput = {};

    // Search
    if (search) {
      where.searchUnicode = {
        contains: StringUtil.formatUnicode(search, { lowercase: true }),
        mode: 'insensitive',
      };
    }

    // status là mảng (lọc nhiều trạng thái cùng lúc) nên dùng `in`
    if (status?.length) {
      where.status = { in: status };
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
  private buildSelect(field: INFO_TYPE): Prisma.RoleSelect {
    // Các field tối thiểu RoleResponseDto cần. Thiếu createdAt/updatedAt thì
    // toRoleResponse crash ở .toISOString(), thiếu permissions thì trả undefined.
    const BASE_SELECT: Prisma.RoleSelect = {
      id: true,
      name: true,
      description: true,
      status: true,
      permissions: true,
      createdAt: true,
      updatedAt: true,
    };

    // LIST_INFO chỉ trả các thông tin cơ bản để hiển thị danh sách.
    // authorId đi kèm để toRoleResponse có thể lấy tên người tạo.
    const ROLE_SELECT_BY_INFO: Record<INFO_TYPE, Prisma.RoleSelect> = {
      [FULL_INFO]: {
        ...BASE_SELECT,
        authorId: true,
      },
      [LIST_INFO]: {
        id: true,
        name: true,
        status: true,
        authorId: true,
      },
      [SIMPLE_INFO]: {
        ...BASE_SELECT,
        authorId: true,
      },
    };

    return {
      ...(ROLE_SELECT_BY_INFO[field] ?? ROLE_SELECT_BY_INFO[SIMPLE_INFO]),
    };
  }

  async findOne(id: number) {
    const role = await this.prismaService.role.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Không tìm thấy role');
    }

    return role;
  }

  async update(id: number, data: UpdateRoleData) {
    await this.findOne(id);

    // Chỉ pick các field được phép sửa. `status` cố tình bị loại bỏ —
    // đổi trạng thái phải đi qua changeStatus để có một đường duy nhất.
    const { name, description, permissions } = data;

    return this.prismaService.role.update({
      where: { id },
      data: {
        ...(name !== undefined
          ? { name, searchUnicode: StringUtil.toSearchKey([name]) }
          : {}),
        ...(description !== undefined ? { description } : {}),
        // PATCH permissions thay thế toàn bộ danh sách (giống setPermissions)
        ...(permissions !== undefined ? { permissions } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Hard delete — dùng khi thật sự muốn xoá bản ghi khỏi DB.
  // user_roles có FK ON DELETE RESTRICT nên phải xoá các bản ghi liên kết trước.
  async remove(id: number) {
    await this.findOne(id);

    return this.prismaService.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { roleId: id } });
      await tx.role.delete({ where: { id } });
      return id;
    });
  }

  async create(data: CreateRoleTcpRequest) {
    const { permissions = [], ...roleData } = data;

    if (await this.existsByName(roleData.name)) {
      throw new BadRequestException(`Tên role "${roleData.name}" đã tồn tại`);
    }

    const userId = '00000000-0000-0000-0000-000000000001';

    return this.prismaService.role.create({
      data: {
        ...roleData,
        permissions,
        authorId: userId,
        searchUnicode: StringUtil.toSearchKey([roleData.name]),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async setPermissions(id: number, permissions: PERMISSION[]) {
    await this.findOne(id);
    return this.prismaService.role.update({
      where: { id },
      data: { permissions },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Bật/tắt trạng thái hoạt động (thay cho delete mềm)
  async changeStatus(id: number, status: ROLE_STATUS) {
    await this.findOne(id);
    return this.prismaService.role.update({
      where: { id },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prismaService.role.count({
      where: { name },
    });
    return count > 0;
  }
}

export type RoleEntity = Awaited<ReturnType<RoleRepository['findOne']>>;
