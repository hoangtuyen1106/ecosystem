import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MetadataKeys } from '@ecosystem/constants';
import { getProcessId } from '@ecosystem/utils';

export const ProcessId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request[MetadataKeys.PROCESS_ID] || getProcessId();
});
