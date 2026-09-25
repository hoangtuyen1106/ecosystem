import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService, {
    provide: 'REDIS_CLIENT',
    async useFactory(configService: ConfigService) {
      return new Redis({
          host: configService.getOrThrow<string>('REDIS_HOST'),
          port: configService.getOrThrow<number>('REDIS_PORT'),
        });
    }
  }],
  exports: [],
})
export class RedisModule {}
