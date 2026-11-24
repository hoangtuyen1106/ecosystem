import {
  CreateUserRequestDto
} from '@ecosystem/interfaces';
import { StringUtil } from '@ecosystem/utils';
import {
  BadRequestException,
  Injectable,
  Logger
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { UserGender, UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

const USER_ROLES_SELECT = {
  select: {
    role: {
      select: {
        id: true,
        name: true,
      },
    },
  },
} as const;

// `as const` giữ literal `true` để Prisma suy ra đúng kiểu của quan hệ roles
const USER_WITH_ROLES = {
  roles: USER_ROLES_SELECT,
} as const;

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);
  private readonly saltRounds = 9;
  constructor(private readonly prismaService: PrismaService) {}

  async create(params: CreateUserRequestDto) {
    let roleIds = params.roleIds;

    if (roleIds?.length) {
      roleIds = await this.validateRoleIds(roleIds);
    }
    this.logger.debug('params create user' + JSON.stringify(params));

    const user = await this.prismaService.user.create({
      data: {
        id: params.id,
        username: params.username,
        email: params.email,
        password: await hash(params.password, this.saltRounds),
        keycloakId: params.keycloakId,
        firstName: params.firstName,
        lastName: params.lastName,
        avatar: params.avatar,
        phone: params.phone,
        birthday: params.birthday,
        // Enum constants và Prisma đều dùng member chữ thường (male, active...)
        ...(params.gender
          ? { gender: params.gender as unknown as UserGender }
          : {}),
        ...(params.status
          ? { status: params.status as unknown as UserStatus }
          : {}),
        searchUnicode: StringUtil.toSearchKey([
          params.username,
          params.email,
          params.firstName,
          params.lastName,
          params.phone,
        ]),
        roles: {
          create: (roleIds ?? []).map((roleId) => ({
            role: { connect: { id: roleId } },
          })),
        },
      },
      include: USER_WITH_ROLES,
    });
    return this.flatten(user);
  }

  getUserByKeycloakId(keycloakId: string) {
    return this.prismaService.user.findFirst({
      where: {
        keycloakId
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  

  // async findAllUser(query: GetUsersOffsetTcpRequest) {
  //   const { page = 1, limit = 10 } = query;

  //   const { where, orderBy, select } = this.buildQuery(query);

  //   const skip = (page - 1) * limit;

  //   const [items, totalItems] = await Promise.all([
  //     this.prismaService.user.findMany({
  //       where,
  //       skip,
  //       take: limit,
  //       orderBy,
  //       select,
  //     }),
  //     this.prismaService.user.count({ where }),
  //   ]);

  //   const totalPages = Math.ceil(totalItems / limit);

  //   return {
  //     items,
  //     meta: {
  //       page,
  //       limit,
  //       totalItems,
  //       totalPages,
  //       hasNextPage: page < totalPages,
  //       hasPreviousPage: page > 1,
  //     },
  //   };
  // }

  // async findAllCursor(query: GetUsersCursorTcpRequest) {
  //   const { cursor, take = 10 } = query;

  //   const { where, orderBy, select } = this.buildQuery(query);

  //   const items = await this.prismaService.user.findMany({
  //     where,
  //     take: take + 1,
  //     ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  //     orderBy,
  //     select,
  //   });

  //   const hasNextPage = items.length > take;
  //   if (hasNextPage) {
  //     items.pop();
  //   }

  //   const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

  //   return {
  //     items,
  //     meta: {
  //       take,
  //       hasNextPage,
  //       nextCursor,
  //     },
  //   };
  // }

  // private buildQuery(query: GetUsersQueryDto) {
  //   const { sortBy = 'id', sortOrder = 'ASC', field = SIMPLE_INFO } = query;

  //   return {
  //     where: this.buildWhere(query),
  //     orderBy: this.buildOrderBy(sortBy, sortOrder),
  //     select: this.buildSelect(field),
  //   };
  // }

  // private buildWhere(query: GetUsersQueryDto): Prisma.UserWhereInput {
  //   const { search, status } = query;

  //   // User xoá mềm không bao giờ xuất hiện trong list/findOne
  //   const where: Prisma.UserWhereInput = { deleted: false };

  //   if (search) {
  //     where.searchUnicode = {
  //       contains: StringUtil.formatUnicode(search, { lowercase: true }),
  //       mode: 'insensitive',
  //     };
  //   }

  //   if (status?.length) {
  //     where.status = { in: status as unknown as UserStatus[] };
  //   }

  //   return where;
  // }

  // private buildOrderBy(
  //   sortBy: string,
  //   sortOrder: string,
  // ): Prisma.UserOrderByWithRelationInput[] {
  //   const SORTABLE_FIELDS = [
  //     'id',
  //     'username',
  //     'email',
  //     'firstName',
  //     'createdAt',
  //     'updatedAt',
  //   ];

  //   const field = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'id';
  //   const direction = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

  //   const orderBy: Prisma.UserOrderByWithRelationInput[] = [
  //     { [field]: direction },
  //   ];
  //   // id làm tie-breaker để cursor luôn nằm trong orderBy
  //   if (field !== 'id') {
  //     orderBy.push({ id: direction });
  //   }

  //   return orderBy;
  // }

  // private buildSelect(field: INFO_TYPE) {
  //   // `as const` giữ literal `true` để Prisma suy ra đúng item trả về
  //   const BASE_SELECT = {
  //     id: true,
  //     username: true,
  //     email: true,
  //     firstName: true,
  //     lastName: true,
  //     avatar: true,
  //     phone: true,
  //     birthday: true,
  //     gender: true,
  //     status: true,
  //     createdAt: true,
  //     updatedAt: true,
  //     roles: USER_ROLES_SELECT,
  //   } as const;

  //   // LIST_INFO chỉ trả các field cơ bản để hiển thị danh sách
  //   const LIST_SELECT = {
  //     id: true,
  //     username: true,
  //     email: true,
  //     firstName: true,
  //     lastName: true,
  //     status: true,
  //   } as const;

  //   return field === LIST_INFO ? LIST_SELECT : BASE_SELECT;
  // }

  // async findOne(id: string) {
  //   const user = await this.prismaService.user.findFirst({
  //     where: { id, deleted: false },
  //     include: USER_WITH_ROLES,
  //   });

  //   if (!user) {
  //     throw new NotFoundException('Không tìm thấy user');
  //   }

  //   return user;
  // }

  // async update(id: string, data: UpdateUserRequestDto) {
  //   const current = await this.findOne(id);

  //   const {
  //     username,
  //     email,
  //     firstName,
  //     lastName,
  //     avatar,
  //     phone,
  //     birthday,
  //     gender,
  //   } = data;

  //   return this.prismaService.user.update({
  //     where: { id },
  //     data: {
  //       ...(username !== undefined ? { username } : {}),
  //       ...(email !== undefined ? { email } : {}),
  //       ...(firstName !== undefined ? { firstName } : {}),
  //       ...(lastName !== undefined ? { lastName } : {}),
  //       ...(avatar !== undefined ? { avatar } : {}),
  //       ...(phone !== undefined ? { phone } : {}),
  //       ...(birthday !== undefined ? { birthday } : {}),
  //       ...(gender !== undefined
  //         ? { gender: gender as unknown as UserGender }
  //         : {}),
  //       // Các field nằm trong khoá tìm kiếm đổi thì phải tính lại searchUnicode
  //       searchUnicode: StringUtil.toSearchKey([
  //         username ?? current.username,
  //         email ?? current.email,
  //         firstName ?? current.firstName,
  //         lastName ?? current.lastName,
  //         phone ?? current.phone,
  //       ]),
  //     },
  //     include: USER_WITH_ROLES,
  //   });
  // }

  // // Soft delete: giữ dữ liệu và user_roles, chỉ đánh dấu deleted
  // async remove(id: string) {
  //   await this.findOne(id);

  //   return this.prismaService.user.update({
  //     where: { id },
  //     data: { deleted: true },
  //     select: { id: true },
  //   });
  // }

  // async changeStatus(id: string, status: USER_STATUS) {
  //   await this.findOne(id);

  //   return this.prismaService.user.update({
  //     where: { id },
  //     data: { status: status as unknown as UserStatus },
  //     include: USER_WITH_ROLES,
  //   });
  // }

  

  // async getUsers() {
  //   return await this.prismaService.user.findMany();
  // }

  // async getUser(args: Prisma.UserWhereUniqueInput) {
  //   return await this.prismaService.user.findUniqueOrThrow({
  //     where: args,
  //   });
  // }

  // getByUserId(user_id: string) {
  //   return this.prismaService.user.findFirst({
  //     where: {
  //       id: user_id,
  //     },
  //   });
  // }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    // email không còn @unique trong schema nên phải dùng findFirst
    const result = await this.prismaService.user.findFirst({
      where: {
        email,
        deleted: false,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: {
        id: true,
      },
    });

    return !!result;
  }

  private async validateRoleIds(roleIds: number[]) {
    const uniqueIds = [...new Set(roleIds)];
    const count = await this.prismaService.role.count({
      where: { id: { in: uniqueIds } },
    });
    if (count !== uniqueIds.length) {
      throw new BadRequestException('One or more roleIds do not exist');
    }
    return uniqueIds;
  }

  // { roles: [{ role: { id, name } }] } -> { roles: [{ id, name }] }
  private flatten(user: any) {
    return {
      ...user,
      roles: user.roles.map((ur: any) => ur.role),
    };
  }
}
