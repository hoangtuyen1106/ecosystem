import { ThrottlerProvider } from '@ecosystem/configuration';
import { LoggerModule } from '@ecosystem/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ExceptionInterceptor } from '@ecosystem/interceptors';
import { AuthModule } from './auth/auth.module';
import { GrpcClientsModule } from './grpc-clients.module';
import { UserGuard } from './common/guards/user.guard';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerProvider,
    GrpcClientsModule,
    HealthModule,
    UsersModule,
    RolesModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UserGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ExceptionInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
