import { TCP_REQUEST_MESSAGE, TCP_SERVICES } from '@ecosystem/constants';
import {
  ChangeUserStatusRequestDto,
  ChangeUserStatusTcpRequest,
  CreateUserRequestDto,
  CreateUserTcpRequest,
  formatResponseDates,
  GetUsersCursorQueryDto,
  GetUsersCursorTcpRequest,
  GetUsersOffsetQueryDto,
  GetUsersOffsetTcpRequest,
  ResponseDto,
  TcpClient,
  UpdateUserRequestDto,
  UpdateUserTcpRequest,
  UserListCursorTcpResponse,
  UserListOffsetTcpResponse,
  UserTcpResponse,
} from '@ecosystem/interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(TCP_SERVICES.AUTH_SERVICE) private readonly authClient: TcpClient,
  ) {}

  create(body: CreateUserRequestDto) {
    return this.authClient
      .send<
        UserTcpResponse,
        CreateUserTcpRequest
      >(TCP_REQUEST_MESSAGE.USER.CREATE, body)
      .pipe(
        map((data) => new ResponseDto({ data: formatResponseDates(data) })),
      );
  }

  findAll(query?: GetUsersOffsetQueryDto) {
    return this.authClient
      .send<
        UserListOffsetTcpResponse,
        GetUsersOffsetTcpRequest
      >(TCP_REQUEST_MESSAGE.USER.GET_ALL, query)
      .pipe(
        map((data) => new ResponseDto({ data: formatResponseDates(data) })),
      );
  }

  findAllCursor(query?: GetUsersCursorQueryDto) {
    return this.authClient
      .send<
        UserListCursorTcpResponse,
        GetUsersCursorTcpRequest
      >(TCP_REQUEST_MESSAGE.USER.GET_ALL_CURSOR, query)
      .pipe(
        map((data) => new ResponseDto({ data: formatResponseDates(data) })),
      );
  }

  findOne(id: string) {
    return this.authClient
      .send<UserTcpResponse, string>(TCP_REQUEST_MESSAGE.USER.GET_BY_ID, id)
      .pipe(
        map((data) => new ResponseDto({ data: formatResponseDates(data) })),
      );
  }

  update(id: string, body: UpdateUserRequestDto) {
    return this.authClient
      .send<
        UserTcpResponse,
        UpdateUserTcpRequest
      >(TCP_REQUEST_MESSAGE.USER.UPDATE, { id, ...body })
      .pipe(
        map((data) => new ResponseDto({ data: formatResponseDates(data) })),
      );
  }

  remove(id: string) {
    return this.authClient
      .send<string, string>(TCP_REQUEST_MESSAGE.USER.DELETE, id)
      .pipe(
        map((data) => new ResponseDto({ data: formatResponseDates(data) })),
      );
  }

  changeStatus(id: string, body: ChangeUserStatusRequestDto) {
    return this.authClient
      .send<UserTcpResponse, ChangeUserStatusTcpRequest>(
        TCP_REQUEST_MESSAGE.USER.CHANGE_STATUS,
        { id, status: body.status },
      )
      .pipe(
        map((data) => new ResponseDto({ data: formatResponseDates(data) })),
      );
  }
}
