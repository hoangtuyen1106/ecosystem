import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleRepository } from './repositories/role.repository';

@Module({
  imports: [PrismaModule],
  providers: [RoleService, RoleRepository],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
