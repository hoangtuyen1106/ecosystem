import { PERMISSION } from '@ecosystem/constants';
import {
  CreateRoleRequestDto,
  GetRolesQueryDto,
  UpdateRoleRequestDto,
} from '../../gateway/role';

export type CreateRoleTcpRequest = CreateRoleRequestDto;

export type UpdateRoleTcpRequest = UpdateRoleRequestDto & { id: number };

export type GetRolesTcpRequest = GetRolesQueryDto | undefined;

export type DeleteRoleTcpRequest = number;

export type SetRolePermissionsTcpRequest = {
  roleId: number;
  permissions: PERMISSION[];
};
