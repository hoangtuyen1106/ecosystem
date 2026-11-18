import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../common';

export class UserResponseDto extends BaseResponseDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}
