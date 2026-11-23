import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KeycloakModule } from '../keycloak/keycloak.module';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule, KeycloakModule],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
