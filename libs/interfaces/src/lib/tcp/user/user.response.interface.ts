import { PERMISSION } from '@ecosystem/constants';
import { CursorPaginationResult, OffsetPaginationResult } from '../../common';
import { UserResponseDto } from '../../gateway/user';

export type UserTcpResponse = UserResponseDto;

export type UserListOffsetTcpResponse = OffsetPaginationResult<UserResponseDto>;
export type UserListCursorTcpResponse = CursorPaginationResult<UserResponseDto>;

/** Thông tin user + role tối thiểu để auth verify token và trả metadata. */
export type UserRoleAuthInfo = {
  name: string;
  description: string;
  permissions: PERMISSION[];
};

export type UserAuthInfoTcpResponse = {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  keycloakId: string;
  roles: UserRoleAuthInfo[];
};
