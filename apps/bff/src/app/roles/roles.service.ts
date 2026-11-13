import { TCP_REQUEST_MESSAGE, TCP_SERVICES } from '@ecosystem/constants';
import {
  CreateRoleRequestDto,
  CreateRoleTcpRequest,
  formatResponseDates,
  GetRolesQueryDto,
  GetRolesTcpRequest,
  ResponseDto,
  RoleListTcpResponse,
  RoleTcpResponse,
  SetRolePermissionsRequestDto,
  SetRolePermissionsTcpRequest,
  TcpClient,
  UpdateRoleRequestDto,
  UpdateRoleTcpRequest,
} from '@ecosystem/interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class RolesService {
  constructor(
    @Inject(TCP_SERVICES.AUTH_SERVICE) private readonly authClient: TcpClient,
  ) {}

  create(body: CreateRoleRequestDto) {
    return this.authClient
      .send<RoleTcpResponse, CreateRoleTcpRequest>(
        TCP_REQUEST_MESSAGE.ROLE.CREATE,
        body,
      )
      .pipe(map((data) => new ResponseDto({ data: formatResponseDates(data) })));
  }

  findAll(query?: GetRolesQueryDto) {
    return this.authClient
      .send<RoleListTcpResponse, GetRolesTcpRequest>(
        TCP_REQUEST_MESSAGE.ROLE.GET_ALL,
        query,
      )
      .pipe(map((data) => new ResponseDto({ data: formatResponseDates(data) })));
  }

  findOne(id: number) {
    return this.authClient
      .send<RoleTcpResponse, number>(TCP_REQUEST_MESSAGE.ROLE.GET_BY_ID, id)
      .pipe(map((data) => new ResponseDto({ data: formatResponseDates(data) })));
  }

  update(id: number, body: UpdateRoleRequestDto) {
    return this.authClient
      .send<RoleTcpResponse, UpdateRoleTcpRequest>(
        TCP_REQUEST_MESSAGE.ROLE.UPDATE,
        { id, ...body },
      )
      .pipe(map((data) => new ResponseDto({ data: formatResponseDates(data) })));
  }

  remove(id: number) {
    return this.authClient
      .send<string, number>(TCP_REQUEST_MESSAGE.ROLE.DELETE, id)
      .pipe(map((data) => new ResponseDto({ data: formatResponseDates(data) })));
  }

  setPermissions(id: number, body: SetRolePermissionsRequestDto) {
    return this.authClient
      .send<RoleTcpResponse, SetRolePermissionsTcpRequest>(
        TCP_REQUEST_MESSAGE.ROLE.SET_PERMISSIONS,
        { roleId: id, permissions: body.permissions },
      )
      .pipe(map((data) => new ResponseDto({ data: formatResponseDates(data) })));
  }
}
