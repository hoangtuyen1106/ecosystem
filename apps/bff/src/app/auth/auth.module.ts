import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TCP_PORT, TCP_SERVICES } from '@ecosystem/constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: TCP_SERVICES.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: TCP_PORT.TCP_AUTH_PORT,
        },
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
