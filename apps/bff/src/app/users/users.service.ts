import { TCP_REQUEST_MESSAGE, TCP_SERVICES } from '@ecosystem/constants';
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
    @Inject(TCP_SERVICES.AUTH_SERVICE) private readonly authClient: TcpClient,
  ) {}

  create(body: CreateUserRequestDto) {
    return this.authClient
      .send<string, CreateUserTcpRequest>(TCP_REQUEST_MESSAGE.USER.CREATE, body)
      .pipe(map((data) => new ResponseDto({ data })));
  }
}
