import { CursorPaginationResult, OffsetPaginationResult } from '../../common';
import { UserResponseDto } from '../../gateway/user';

export type UserTcpResponse = UserResponseDto;

export type UserListOffsetTcpResponse = OffsetPaginationResult<UserResponseDto>;
export type UserListCursorTcpResponse = CursorPaginationResult<UserResponseDto>;
