import { HTTP_MESSAGE, TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import { RequestParams } from '@ecosystem/decorators';
import { TcpLoggingInterceptor } from '@ecosystem/interceptors';
import {
  CreateUserTcpRequest,
  Response
} from '@ecosystem/interfaces';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
@UseInterceptors(TcpLoggingInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.USER.CREATE)
  async create(@RequestParams() data: CreateUserTcpRequest) {
    await this.userService.create(data);
    return Response.success<string>(HTTP_MESSAGE.CREATED);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.USER.GET_BY_KEYCLOAK_ID)
  async getByKeycloakId(@RequestParams('keycloakId') keycloakId: string) {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return Response.success(user);
  }

  // @MessagePattern(TCP_REQUEST_MESSAGE.USER.GET_ALL)
  // async findAllUser(@RequestParams() query: GetUsersOffsetTcpRequest) {
  //   const users = await this.userService.findAllUser(query);
  //   return Response.success<UserListOffsetTcpResponse>(users);
  // }

  // @MessagePattern(TCP_REQUEST_MESSAGE.USER.GET_ALL_CURSOR)
  // async findAllCursor(@RequestParams() query: GetUsersCursorTcpRequest) {
  //   const users = await this.userService.findAllCursor(query);
  //   return Response.success<UserListCursorTcpResponse>(users);
  // }

  // @MessagePattern(TCP_REQUEST_MESSAGE.USER.GET_BY_ID)
  // async findOne(@RequestParams() id: string) {
  //   const user = await this.userService.findOne(id);
  //   return Response.success<UserTcpResponse>(user);
  // }

  // @MessagePattern(TCP_REQUEST_MESSAGE.USER.UPDATE)
  // async update(@RequestParams() data: UpdateUserTcpRequest) {
  //   const user = await this.userService.update(data);
  //   return Response.success<UserTcpResponse>(user);
  // }

  // @MessagePattern(TCP_REQUEST_MESSAGE.USER.DELETE)
  // async remove(@RequestParams() id: string) {
  //   await this.userService.remove(id);
  //   return Response.success<string>(HTTP_MESSAGE.DELETED);
  // }

  // @MessagePattern(TCP_REQUEST_MESSAGE.USER.CHANGE_STATUS)
  // async changeStatus(@RequestParams() data: ChangeUserStatusTcpRequest) {
  //   const user = await this.userService.changeStatus(data);
  //   return Response.success<UserTcpResponse>(user);
  // }

  // @MessagePattern(TCP_REQUEST_MESSAGE.USER.GET_BY_USER_ID)
  // async getByUserId(@RequestParams() userId: string) {
  //   const user = await this.userService.getUserByUserId(userId);
  //   return Response.success(user);
  // }
}
