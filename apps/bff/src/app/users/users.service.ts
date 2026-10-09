import { TCP_SERVICES } from '@ecosystem/configuration';
import { TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import {
  CreateUserRequestDto,
  CreateUserTcpRequest,
  ResponseDto,
  TcpClient,
} from '@ecosystem/interfaces';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { catchError, map } from 'rxjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(TCP_SERVICES.TCP_USER_SERVICE)
    private readonly userClient: TcpClient,
  ) {}

  create(body: CreateUserRequestDto) {
    return this.userClient
      .send<string, CreateUserTcpRequest>(TCP_REQUEST_MESSAGE.USER.CREATE, body)
      .pipe(
        map((data) => new ResponseDto({ data })),
        catchError((error) => {
          this.logger.error('Error from auth service:', error);
          // Extract message from error object
          const errorMessage = error?.message || error?.error?.message || 'Failed to create user';
          throw new BadRequestException(errorMessage);
        })
      );
  }
}
