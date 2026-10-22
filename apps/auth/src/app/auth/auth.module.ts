import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { KeycloakModule } from '../keycloak/keycloak.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthorizerGrpcController } from './authorizer-grpc.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow('JWT_EXPIRATION_MS'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    KeycloakModule,
    PrismaModule,
  ],
  controllers: [AuthController, AuthorizerGrpcController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
