import { MetadataKeys } from '@ecosystem/constants';
import { getAccessToken } from '@ecosystem/utils';
import {
  CanActivate,
  ExecutionContext,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export class UserGuard implements CanActivate {
  private readonly logger = new Logger(UserGuard.name);
  private authorizerService: AuthorizerService;

  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authOptions = this.reflector.getAllAndOverride<{ secured: boolean }>(
      MetadataKeys.SECURED,
      [context.getHandler(), context.getClass()],
    );
    const req = context.switchToHttp().getRequest();

    if(!authOptions?.secured) {
        return true;
    }
    return true;
  }

  private async verifyToken(req: any): Promise<boolean> {
    try {
        const token = getAccessToken(req);
        
    }
  }
}
