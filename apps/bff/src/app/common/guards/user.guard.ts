import { MetadataKeys } from '@ecosystem/constants';
import {
  AUTHORIZER_SERVICE_NAME,
  AuthorizerServiceClient,
  Packages,
} from '@ecosystem/grpc';
import { getAccessToken } from '@ecosystem/utils';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

export class UserGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(UserGuard.name);
  private authorizerService: AuthorizerServiceClient;

  constructor(
    private readonly reflector: Reflector,
    @Inject(Packages.AUTH) private clientAuth: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authorizerService =
      this.clientAuth.getService<AuthorizerServiceClient>(
        AUTHORIZER_SERVICE_NAME,
      );
  }
  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authOptions = this.reflector.getAllAndOverride<{ secured: boolean }>(
      MetadataKeys.SECURED,
      [context.getHandler(), context.getClass()],
    );
    const req = context.switchToHttp().getRequest();

    if (!authOptions?.secured) {
      return true;
    }

    return this.verifyToken(req);
  }

  private async verifyToken(req: any): Promise<boolean> {
    try {
      const token = getAccessToken(req);
      const response = await firstValueFrom(
        this.authorizerService.verifyUserToken({ token }),
      );

      const { data: result } = response;

      if (!result?.valid) {
        throw new UnauthorizedException('Token is invalid');
      }

      return true;
    } catch (error) {
      this.logger.error({ error });
      throw new UnauthorizedException('Token is invalid');
    }
  }
}
