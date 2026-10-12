import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { Logger } from '@nestjs/common';

const logger = new Logger('ThrottlerRedisConfig');

export const ThrottlerProvider = ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const redisClient = new ThrottlerStorageRedisService({
      host: configService.getOrThrow('REDIS_HOST'),
      port: configService.getOrThrow('REDIS_PORT'),
    });

    // Add error handlers to prevent unhandled error events
    redisClient.redis?.on('error', (err: Error) => {
      logger.error(`Redis connection error: ${err.message}`, err.stack);
    });

    redisClient.redis?.on('connect', () => {
      logger.log('Redis throttler storage connected');
    });

    redisClient.redis?.on('reconnecting', () => {
      logger.warn('Redis throttler storage reconnecting...');
    });

    return {
      throttlers: [{ ttl: 60000, limit: 1000 }],
      errorMessage: 'Too many requests, please try again later.',
      storage: redisClient,
    };
  },
});
