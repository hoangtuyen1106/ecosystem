import { HTTP_MESSAGE, TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import { RequestParams } from '@ecosystem/decorators';
import { TcpLoggingInterceptor } from '@ecosystem/interceptors';
import {
  ChangeRoleStatusTcpRequest,
  CreateRoleTcpRequest,
  GetRolesCursorTcpRequest,
  GetRolesOffsetTcpRequest,
  Response,
  RoleListCursorTcpResponse,
  RoleListOffsetTcpResponse,
  RoleTcpResponse,
  SetRolePermissionsTcpRequest,
  UpdateRoleTcpRequest
} from '@ecosystem/interfaces';
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
  async findAllRole(@RequestParams() query: GetRolesOffsetTcpRequest) {
    const roles = await this.roleService.findAllRole(query);
    return Response.success<RoleListOffsetTcpResponse>(roles);
  }

  @MessagePattern(TCP_REQUEST_MESSAGE.ROLE.GET_ALL_CURSOR)
  async findAllCursor(@RequestParams() query: GetRolesCursorTcpRequest) {
    const roles = await this.roleService.findAllCursor(query);
    return Response.success<RoleListCursorTcpResponse>(roles);
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

  @MessagePattern(TCP_REQUEST_MESSAGE.ROLE.CHANGE_STATUS)
  async changeStatus(@RequestParams() data: ChangeRoleStatusTcpRequest) {
    const role = await this.roleService.changeStatus({
      ...data,
      id: Number(data.id),
    });
    return Response.success<RoleTcpResponse>(role);
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
