import { PERMISSION } from '@ecosystem/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../common/base-response.dto';

export class RoleResponseDto extends BaseResponseDto {
  @ApiProperty()
  override id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ enum: PERMISSION, isArray: true })
  permissions: PERMISSION[];
}
