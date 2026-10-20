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
        name: TCP_SERVICES.AUTH_SERVICE, // Tên token để inject
        transport: Transport.TCP,
        options: {
          host: 'localhost', // Hoặc địa chỉ IP của user service
          port: TCP_PORT.TCP_AUTH_PORT, // Port mà Orders service sẽ lắng nghe
        },
      }
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
