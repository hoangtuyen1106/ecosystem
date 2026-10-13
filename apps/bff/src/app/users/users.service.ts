import { TCP_SERVICES } from '@ecosystem/configuration';
import { TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import {
  CreateUserRequestDto,
  CreateUserTcpRequest,
  ResponseDto,
  TcpClient,
} from '@ecosystem/interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(TCP_SERVICES.TCP_USER_SERVICE)
    private readonly userClient: TcpClient,
  ) {}

  create(body: CreateUserRequestDto) {
    return this.userClient
      .send<string, CreateUserTcpRequest>(TCP_REQUEST_MESSAGE.USER.CREATE, body)
      .pipe(map((data) => new ResponseDto({ data })));
  }
}
