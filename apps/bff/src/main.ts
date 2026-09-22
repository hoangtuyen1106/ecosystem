require('module-alias/register');
import { Packages } from '@ecosystem/grpc';
import { init } from '@ecosystem/nestjs';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = new DocumentBuilder()
    .setTitle('Ecosystem API')
    .setDescription('API docs')
    .setVersion('1.0.0')
    .addBearerAuth({
      description: 'Default JWT Authorization',
      type: 'http',
      in: 'header',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);
  await init(app, 'bff');
  app.enableCors({
    origin: '*',
  });

  // app.connectMicroservice<GrpcOptions>({
  //   transport: Transport.GRPC,
  //   options: {
  //     url: app.get(ConfigService).getOrThrow('BFF_GRPC_SERVICE_URL'),
  //     package: Packages.BFF,
  //     protoPath: join(__dirname, '../../libs/grpc/proto/bff.proto'),
  //   },
  // });

 
  await app.startAllMicroservices();
}

bootstrap();
