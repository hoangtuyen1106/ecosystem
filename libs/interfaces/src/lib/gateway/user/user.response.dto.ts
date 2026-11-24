import { USER_GENDER, USER_STATUS } from '@ecosystem/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../common';

export class UserResponseDto extends BaseResponseDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  birthday?: string;

  @ApiPropertyOptional({ enum: USER_GENDER })
  gender?: USER_GENDER;

  @ApiProperty({ enum: USER_STATUS })
  status: USER_STATUS;

  @ApiProperty()
  keycloakId: string;

  @ApiProperty({ description: 'ID các role của user', type: [Number] })
  roleIds: number[];

  @ApiProperty({ description: 'Tên các role của user', type: [String] })
  roleNames: string[];
}
