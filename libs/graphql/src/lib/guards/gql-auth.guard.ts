import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, map, of } from 'rxjs';
import { Packages, AUTHORIZER_SERVICE_NAME, AuthorizerServiceClient } from '@ecosystem/grpc';

@Injectable()
export class GqlAuthGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(GqlAuthGuard.name);
  private authService: AuthorizerServiceClient;
  constructor(@Inject(Packages.AUTH) private client: ClientGrpc) {}
  onModuleInit() {
    this.authService =
      this.client.getService<AuthorizerServiceClient>(AUTHORIZER_SERVICE_NAME);
  }
  canActivate(context: ExecutionContext) {
    const token = this.getRequest(context).cookies?.Authentication;

    if (!token) {
      return false;
    }

    return this.authService.verifyUserToken({ token }).pipe(
      map((res) => {
        this.getRequest(context).user = res;
        return true;
      }),
      catchError((err) => {
        this.logger.error(err);
        return of(false);
      }),
    );
  }

  private getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
