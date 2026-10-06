import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  AuthenticateRequest,
  AuthServiceController,
  AuthServiceControllerMethods,
  CreateUserRequest,
  GrpcLoggingInterceptor,
  User,
} from '@ecosystem/grpc';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './token-payload.interface';
import { CreateUserInput } from '@ecosystem/interfaces';
import { USER_STATUS } from '@ecosystem/constants';

@Controller()
@AuthServiceControllerMethods()
@UseInterceptors(GrpcLoggingInterceptor)
export class AuthController implements AuthServiceController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  authenticate(
    request: AuthenticateRequest & { user: TokenPayload },
  ): Promise<User> | Observable<User> | User {
    return this.usersService.getUser({ id: request.user.userId });
  }

  async createUser(request: CreateUserRequest): Promise<User> {
    const createUserInput: CreateUserInput = {
      email: request.email,
      password: request.password,
      firstName: '',  // gRPC request không có firstName, default empty string
      status: USER_STATUS.ACTIVE,
    };
    const user = await this.usersService.createUser(createUserInput);
    return {
      id: user.id,
      email: user.email,
    };
  }
}
