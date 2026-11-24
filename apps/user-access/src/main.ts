require('module-alias/register');
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { TCP_PORT } from '@ecosystem/constants';
import { init } from '@ecosystem/nestjs';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await init(app, 'user-access');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: app.get(ConfigService).getOrThrow<string>('TCP_HOST') ?? 'localhost',
      port: TCP_PORT.TCP_USER_ACCESS_PORT,
    },
  });

  await app.startAllMicroservices();
}

bootstrap();
