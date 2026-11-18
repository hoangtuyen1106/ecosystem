import { CursorPaginationResult, OffsetPaginationResult } from '../../common';
import { RoleResponseDto } from '../../gateway/role';

export type RoleTcpResponse = RoleResponseDto;

export type RoleListOffsetTcpResponse = OffsetPaginationResult<RoleResponseDto>;
export type RoleListCursorTcpResponse = CursorPaginationResult<RoleResponseDto>;
