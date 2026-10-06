import { HTTP_MESSAGE } from '@ecosystem/constants';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ type: String })
  message = HTTP_MESSAGE.OK;

  @ApiProperty()
  data?: T;

  @ApiProperty({ type: Number })
  statusCode = HttpStatus.OK;

  @ApiProperty()
  duration?: string;

  constructor(data: Partial<ResponseDto<T>>) {
    Object.assign(this, data);
  }
}
