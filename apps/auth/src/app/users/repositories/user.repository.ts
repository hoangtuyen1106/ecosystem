import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/browser';
import { PrismaService } from '../../prisma/prisma.service';

import { hash } from 'bcryptjs';
import { UserCreateInput } from 'apps/auth/src/generated/prisma/models';

@Injectable()
export class UserRepository {
  private readonly saltRounds = 9;
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: UserCreateInput) {
    return this.prismaService.user.create({
      data: {
        ...data,
        password: await hash(data.password, this.saltRounds),
      },
    });
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const result = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    return !!result;
  }

  async getUsers() {
    return await this.prismaService.user.findMany();
  }

  async getUser(args: Prisma.UserWhereUniqueInput) {
    return await this.prismaService.user.findUniqueOrThrow({
      where: args,
    });
  }

  getByUserId(user_id: string) {
    return this.prismaService.user.findFirst({
      where: {
        id: user_id,
      }
    })
  }

  getUserByKeycloakId(id: string) {
    return this.prismaService.user.findFirst({
      where: {
        keycloakId: id,
      }
    })
  }
}
