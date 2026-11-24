import { Module } from '@nestjs/common';
import { GrpcClientsModule } from '../grpc-clients.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TCP_PORT, TCP_SERVICES } from '@ecosystem/constants';

@Module({
  imports: [
    GrpcClientsModule,
    ClientsModule.register([
      {
        name: TCP_SERVICES.USER_ACCESS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: TCP_PORT.TCP_USER_ACCESS_PORT,
        },
      }
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
