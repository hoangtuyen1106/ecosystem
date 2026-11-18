import { PERMISSION } from '@ecosystem/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../common';

export class RoleResponseDto extends BaseResponseDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ enum: PERMISSION, isArray: true })
  permissions: PERMISSION[];
}
