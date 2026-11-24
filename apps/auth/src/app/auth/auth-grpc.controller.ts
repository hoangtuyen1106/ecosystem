import {
  AuthorizerServiceController,
  AuthorizerServiceControllerMethods,
  GrpcLoggingInterceptor,
  Response,
  VerifyUserTokenRequest,
  VerifyUserTokenResponse,
} from '@ecosystem/grpc';
import { Controller, UseInterceptors } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller()
@AuthorizerServiceControllerMethods()
@UseInterceptors(GrpcLoggingInterceptor)
export class AuthGrpcController  {

  constructor(private readonly authService: AuthService) {}

  async verifyUserToken(
    request: VerifyUserTokenRequest,
  ) {
    // const result = await this.authService.verifyUserToken(request.token);
    // return Response.success(result);
  }
}
