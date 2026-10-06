import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AuthServiceClient,
  CreateUserRequest,
  Packages,
  User,
} from '@ecosystem/grpc';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  private authService: AuthServiceClient;

  constructor(@Inject(Packages.AUTH) private authClient: ClientGrpc) {
    this.authService = this.authClient.getService<AuthServiceClient>(
      'auth.AuthService'
    );
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const request: CreateUserRequest = {
      email: createUserDto.email,
      password: createUserDto.password,
    };

    return firstValueFrom(this.authService.createUser(request));
  }
}
