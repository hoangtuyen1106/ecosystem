import { HTTP_MESSAGE, TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import { RequestParams } from '@ecosystem/decorators';
import {
  CreateRoleTcpRequest,
  GetRolesTcpRequest,
  Response,
  RoleListTcpResponse,
  RoleTcpResponse,
  SetRolePermissionsTcpRequest,
  UpdateRoleTcpRequest,
} from '@ecosystem/interfaces';
import { TcpLoggingInterceptor } from '@ecosystem/interceptors';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RoleService } from './role.service';

@Controller()
@UseInterceptors(TcpLoggingInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.ROLE.CREATE)
  async create(@RequestParams() data: CreateRoleTcpRequest) {
    const role = await this.roleService.create(data);
    return Response.success<RoleTcpResponse>(role);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.ROLE.GET_ALL)
  async findAll(@RequestParams() query: GetRolesTcpRequest) {
    const roles = await this.roleService.findAll(query);
    return Response.success<RoleListTcpResponse>(roles);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.ROLE.GET_BY_ID)
  async findOne(@RequestParams() id: number) {
    const role = await this.roleService.findOne(Number(id));
    return Response.success<RoleTcpResponse>(role);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.ROLE.UPDATE)
  async update(@RequestParams() data: UpdateRoleTcpRequest) {
    const role = await this.roleService.update({
      ...data,
      id: Number(data.id),
    });
    return Response.success<RoleTcpResponse>(role);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.ROLE.DELETE)
  async remove(@RequestParams() id: number) {
    await this.roleService.remove(Number(id));
    return Response.success<string>(HTTP_MESSAGE.DELETED);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.ROLE.SET_PERMISSIONS)
  async setPermissions(@RequestParams() data: SetRolePermissionsTcpRequest) {
    const role = await this.roleService.setPermissions({
      ...data,
      roleId: Number(data.roleId),
    });
    return Response.success<RoleTcpResponse>(role);
  }
}
