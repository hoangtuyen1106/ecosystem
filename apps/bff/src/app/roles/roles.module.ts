import { TCP_PORT, TCP_SERVICES } from '@ecosystem/constants';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

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
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
