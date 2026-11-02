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
export class AuthorizerGrpcController implements AuthorizerServiceController {

  constructor(private readonly authService: AuthService) {}

  async verifyUserToken(
    request: VerifyUserTokenRequest,
  ): Promise<VerifyUserTokenResponse> {
    const result = await this.authService.verifyUserToken(request.token);
    return Response.success(result);
  }
}
