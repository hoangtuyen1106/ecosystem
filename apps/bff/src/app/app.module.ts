import { ThrottlerProvider } from '@ecosystem/configuration';
import { LoggerModule } from '@ecosystem/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { ExceptionInterceptor } from '@ecosystem/interceptors';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerProvider,
    HealthModule,
    UsersModule,
  ],
  controllers: [HealthController, AuthController],
  providers: [
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
