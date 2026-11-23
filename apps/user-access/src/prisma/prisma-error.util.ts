import { BadRequestException, NotFoundException } from '@nestjs/common';

interface PrismaKnownError {
  code?: string;
}

export function mapPrismaError(
  error: unknown,
  entity: 'Role' | 'Permission' | 'User',
): never {
  const code = (error as PrismaKnownError)?.code;

  if (code === 'P2002') {
    throw new BadRequestException(`${entity} name already exists`);
  }

  if (code === 'P2025') {
    throw new NotFoundException(`${entity} not found`);
  }

  throw error;
}
