import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [PrismaModule ],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
