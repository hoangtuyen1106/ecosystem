import { PERMISSION, ROLE_STATUS } from '@ecosystem/constants';
import {
  CreateRoleRequestDto,
  GetRolesCursorQueryDto,
  GetRolesOffsetQueryDto,
  GetRolesQueryDto,
  UpdateRoleRequestDto,
} from '../../gateway/role';

export type CreateRoleTcpRequest = CreateRoleRequestDto;

export type UpdateRoleTcpRequest = UpdateRoleRequestDto & { id: number };

export type GetRolesOffsetTcpRequest = GetRolesOffsetQueryDto;

export type GetRolesCursorTcpRequest = GetRolesCursorQueryDto;

export type GetRolesTcpRequest = GetRolesQueryDto;

export type DeleteRoleTcpRequest = number;

export type ChangeRoleStatusTcpRequest = {
  id: number;
  status: ROLE_STATUS;
};

export type SetRolePermissionsTcpRequest = {
  roleId: number;
  permissions: PERMISSION[];
};
