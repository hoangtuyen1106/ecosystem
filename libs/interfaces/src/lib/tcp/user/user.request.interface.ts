import { USER_STATUS } from '@ecosystem/constants';
import {
  CreateUserRequestDto,
  GetUsersCursorQueryDto,
  GetUsersOffsetQueryDto,
  GetUsersQueryDto,
  UpdateUserRequestDto,
} from '../../gateway/user';

export type CreateUserTcpRequest = CreateUserRequestDto;

export type UpdateUserTcpRequest = UpdateUserRequestDto & { id: string };

export type GetUsersOffsetTcpRequest = GetUsersOffsetQueryDto;

export type GetUsersCursorTcpRequest = GetUsersCursorQueryDto;

export type GetUsersTcpRequest = GetUsersQueryDto;

export type DeleteUserTcpRequest = string;

export type GetUserByKeycloakIdTcpRequest = { keycloakId: string };

export type ChangeUserStatusTcpRequest = {
  id: string;
  status: USER_STATUS;
};
