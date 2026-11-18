import { FULL_INFO, INFO_TYPE, LIST_INFO, PERMISSION, SIMPLE_INFO } from '@ecosystem/constants';
import { toBoolean } from '@ecosystem/utils';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CursorPaginationDto, OffsetPaginationDto } from '../common';

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

export class ChangeRoleStatusRequestDto {
  @ApiProperty({ example: false })
  @IsDefined({ message: 'active là bắt buộc' })
  @IsBoolean()
  active: boolean;
}

export class SetRolePermissionsRequestDto {
  @ApiProperty({ enum: PERMISSION_VALUES, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSION_VALUES, { each: true })
  permissions: PERMISSION[];
}

export class GetRolesQueryDto {
  @IsOptional()
  @IsIn([FULL_INFO, LIST_INFO, SIMPLE_INFO])
  field?: INFO_TYPE;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class GetRolesOffsetQueryDto extends IntersectionType(
  OffsetPaginationDto,
  GetRolesQueryDto,
) {}

export class GetRolesCursorQueryDto extends IntersectionType(
  CursorPaginationDto,
  GetRolesQueryDto,
) {}
