import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestParams = createParamDecorator((param: string, ctx: ExecutionContext) => {
  const request = ctx.switchToRpc().getData();

  if (!param) {
    // Handle both { data: {...} } and direct object formats
    return request.data || request;
  }

  return request.data?.[param] || request[param];
});
