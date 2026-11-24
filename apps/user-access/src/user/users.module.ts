import { TCP_PORT, TCP_SERVICES } from '@ecosystem/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: TCP_SERVICES.AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('TCP_AUTH_HOST') ?? 'localhost',
            port: TCP_PORT.TCP_AUTH_PORT,
          },
        }),
      },
    ]),
  ],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
