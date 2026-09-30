import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/browser';
import { PrismaService } from '../../prisma/prisma.service';
import { v7 as uuidv7 } from 'uuid';
import { hash } from 'bcryptjs';

@Injectable()
export class UserRepository {
  private readonly saltRounds = 9;
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    return this.prismaService.user.create({
      data: {
        id: uuidv7(),
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
}
