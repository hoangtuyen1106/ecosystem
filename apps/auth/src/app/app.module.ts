import { LoggerModule } from '@ecosystem/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { RoleModule } from './role/role.module';
import { PermissionController } from './permission.controller';
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    RoleModule,
    KeycloakModule,
    PermissionModule,
  ],
  providers: [],
  controllers: [PermissionController],
})
export class AppModule {}
