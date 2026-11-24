import { TCP_PORT, TCP_SERVICES } from '@ecosystem/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { KeycloakModule } from '../keycloak/keycloak.module';
import { AuthGrpcController } from './auth-grpc.controller';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: TCP_SERVICES.USER_ACCESS_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('TCP_USER_ACCESS_HOST'),
            port: TCP_PORT.TCP_USER_ACCESS_PORT,
          },
        }),
      },
    ]),
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
    KeycloakModule,
  ],
  controllers: [AuthController, AuthGrpcController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
