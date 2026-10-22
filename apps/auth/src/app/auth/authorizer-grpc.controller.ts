import {
  AuthorizerServiceController,
  AuthorizerServiceControllerMethods,
  GrpcLoggingInterceptor,
  VerifyUserTokenRequest,
  VerifyUserTokenResponse,
} from '@ecosystem/grpc';
import { Controller, UseInterceptors } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Controller()
@AuthorizerServiceControllerMethods()
@UseInterceptors(GrpcLoggingInterceptor)
export class AuthorizerGrpcController implements AuthorizerServiceController {

  constructor(private readonly authService: AuthService) {}

  async verifyUserToken(
    request: VerifyUserTokenRequest,
  ):
    | Promise<VerifyUserTokenResponse>
    | Observable<VerifyUserTokenResponse>
    | VerifyUserTokenResponse {
    const result = await this.authService.verifyUserToken
  }
}
