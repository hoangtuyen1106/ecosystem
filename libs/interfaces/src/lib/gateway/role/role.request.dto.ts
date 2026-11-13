import { PERMISSION } from '@ecosystem/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const PERMISSION_VALUES = Object.values(PERMISSION);

export class CreateRoleRequestDto {
  @ApiProperty({ example: 'administrator' })
  @IsString()
  @IsNotEmpty({ message: 'Role name không được để trống' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Quản trị viên' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ enum: PERMISSION_VALUES, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSION_VALUES, { each: true })
  permissions?: PERMISSION[];
}

export class UpdateRoleRequestDto {
  @ApiPropertyOptional({ example: 'administrator' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Role name không được để trống' })
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Quản trị viên' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ enum: PERMISSION_VALUES, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSION_VALUES, { each: true })
  permissions?: PERMISSION[];
}

export class SetRolePermissionsRequestDto {
  @ApiProperty({ enum: PERMISSION_VALUES, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSION_VALUES, { each: true })
  permissions: PERMISSION[];
}

export class GetRolesQueryDto {
  @ApiPropertyOptional({ enum: ['true', 'false'] })
  @IsOptional()
  @IsIn(['true', 'false'])
  includeInactive?: 'true' | 'false';
}
