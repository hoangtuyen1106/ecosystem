import { MetadataKeys } from '@ecosystem/constants';
import { AuthResponse } from '@ecosystem/interfaces';
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const UserData = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const userData = request[MetadataKeys.USER_DATA] as AuthResponse;

  if (!userData) {
    throw new UnauthorizedException('User data not found');
  }

  return userData?.metadata;
});