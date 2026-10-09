import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
