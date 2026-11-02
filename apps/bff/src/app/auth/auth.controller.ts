import { TCP_REQUEST_MESSAGE, TCP_SERVICES } from '@ecosystem/constants';
import {
  LoginRequestDto,
  LoginResponseDto,
  LoginTcpRequest,
  LoginTcpResponse,
  ResponseDto,
  TcpClient,
} from '@ecosystem/interfaces';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';

@ApiTags('Authorizer')
@Controller()
export class AuthController {
  constructor(
    @Inject(TCP_SERVICES.AUTH_SERVICE) private readonly authClient: TcpClient,
  ) {}

  @Post('login')
  @ApiOkResponse({
    type: ResponseDto<LoginResponseDto>,
  })
  @ApiOperation({
    summary: 'Login with username and password',
  })
  login(@Body() body: LoginRequestDto) {
    return this.authClient
      .send<
        LoginTcpResponse,
        LoginTcpRequest
      >(TCP_REQUEST_MESSAGE.AUTHORIZER.LOGIN, body)
      .pipe(map((data) => new ResponseDto(data)));
  }
}
