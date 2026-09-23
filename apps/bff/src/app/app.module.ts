import { ThrottlerProvider } from '@ecosystem/configuration';
import { LoggerModule } from '@ecosystem/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';


@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ThrottlerProvider
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
