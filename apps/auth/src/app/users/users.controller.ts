import { HTTP_MESSAGE, TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import { RequestParams } from '@ecosystem/decorators';
import { CreateUserTcpRequest, Response } from '@ecosystem/interfaces';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly userService: UsersService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.USER.CREATE)
  async create(data: CreateUserTcpRequest) {
    try {
      await this.userService.create(data);
      return Response.success<string>(HTTP_MESSAGE.CREATED);
    } catch (error) {
      this.logger.error('Error creating user:', error);
      // Convert NestJS exception to RpcException for TCP transport
      throw new RpcException({
        statusCode: error.getStatus?.() || 400,
        message: error.message || 'Failed to create user',
      });
    }
  }
}
