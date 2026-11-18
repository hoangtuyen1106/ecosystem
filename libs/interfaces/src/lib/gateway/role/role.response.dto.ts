import { PERMISSION, ROLE_STATUS } from '@ecosystem/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../common';

export class RoleResponseDto extends BaseResponseDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'ID user tạo role (author)' })
  authorId?: string;

  @ApiPropertyOptional({ description: 'Tên (firstName) user tạo role (author)' })
  authorName?: string;

  @ApiProperty({ enum: ROLE_STATUS })
  status: ROLE_STATUS;

  @ApiProperty({ enum: PERMISSION, isArray: true })
  permissions: PERMISSION[];
}
