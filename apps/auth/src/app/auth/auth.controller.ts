import { TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import { RequestParams } from '@ecosystem/decorators';
import { LoginTcpRequest, LoginTcpResponse, Response } from '@ecosystem/interfaces';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { TcpLoggingInterceptor } from '@ecosystem/interceptors';

@Controller()
@UseInterceptors(TcpLoggingInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.AUTHORIZER.LOGIN)
  async login(@RequestParams() params: LoginTcpRequest ) {
    const result = await this.authService.login(params)
    return Response.success<LoginTcpResponse>(result);
  }

}
