import { FULL_INFO, INFO_TYPE, LIST_INFO, PERMISSION, ROLE_STATUS, SIMPLE_INFO } from '@ecosystem/constants';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CursorPaginationDto, OffsetPaginationDto } from '../common';

const PERMISSION_VALUES = Object.values(PERMISSION);
const ROLE_STATUS_VALUES = Object.values(ROLE_STATUS);

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
  @ApiProperty({ enum: ROLE_STATUS_VALUES, example: ROLE_STATUS.INACTIVE })
  @IsDefined({ message: 'status là bắt buộc' })
  @IsIn(ROLE_STATUS_VALUES)
  status: ROLE_STATUS;
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

  @ApiPropertyOptional({ enum: ROLE_STATUS_VALUES, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(ROLE_STATUS_VALUES, { each: true })
  status?: ROLE_STATUS[];

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
