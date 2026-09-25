import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

export const ThrottlerProvider = ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    throttlers: [{ ttl: 60000, limit: 1000 }],
    errorMessage: 'Too many requests, please try again later.',
    storage: new ThrottlerStorageRedisService({
      host: configService.getOrThrow('REDIS_HOST'),
      port: configService.getOrThrow('REDIS_PORT'),
    }),
  }),
});
