import { PERMISSION } from '@ecosystem/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../common';

export class RoleResponseDto extends BaseResponseDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'ID user tạo role' })
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Tên (firstName) user tạo role' })
  createdByName?: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ enum: PERMISSION, isArray: true })
  permissions: PERMISSION[];
}
