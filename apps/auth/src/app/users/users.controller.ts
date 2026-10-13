import { HTTP_MESSAGE, TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import { RequestParams } from '@ecosystem/decorators';
import { CreateUserTcpRequest, Response } from '@ecosystem/interfaces';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { TcpLoggingInterceptor } from '@ecosystem/interceptors';

@Controller()
@UseInterceptors(TcpLoggingInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.USER.CREATE)
  async create(data: CreateUserTcpRequest) {
    await this.userService.create(data);
    return Response.success<string>(HTTP_MESSAGE.CREATED);
  }
}
