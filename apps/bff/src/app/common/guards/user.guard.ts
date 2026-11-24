import { MetadataKeys, TCP_REQUEST_MESSAGE, TCP_SERVICES } from '@ecosystem/constants';
import { AuthResponse, TcpClient } from '@ecosystem/interfaces';
import { getAccessToken, setUserData } from '@ecosystem/utils';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom, map, Observable } from 'rxjs';

export class UserGuard implements CanActivate {
  private readonly logger = new Logger(UserGuard.name);

  constructor(
    private readonly reflector: Reflector,
    // @Inject(Packages.AUTH) private clientAuth: ClientGrpc,
    @Inject(TCP_SERVICES.AUTH_SERVICE) private readonly authorizerClient: TcpClient,
  ) {}
  
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

    return this.verifyUserToken(req);
  }

  private async verifyUserToken(req: Request): Promise<boolean> {
    try {
      const token = getAccessToken(req);

      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const result = await this.verifyToken(token);
      if (!result?.valid) {
        throw new UnauthorizedException('Token is invalid');
      }

      setUserData(req, result);

      return true;
    } catch (error) {
      this.logger.error({ error });
      throw new UnauthorizedException('Token is invalid');
    }
  }

  private async verifyToken(token: string) {
    return firstValueFrom(
      this.authorizerClient
        .send<AuthResponse, { data: string }>(
          TCP_REQUEST_MESSAGE.AUTHORIZER.VERIFY_USER_TOKEN,
          { data: token },
        )
        .pipe(map((data) => data.data)),
    );
  }
}
