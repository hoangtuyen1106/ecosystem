import {
  FULL_INFO,
  INFO_TYPE,
  LIST_INFO,
  SIMPLE_INFO,
  USER_GENDER,
  USER_STATUS,
} from '@ecosystem/constants';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDefined,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import {
  OffsetPaginationDto,
  UuidCursorPaginationDto,
} from '../common/pagination.dto';

const USER_STATUS_VALUES = Object.values(USER_STATUS);
const USER_GENDER_VALUES = Object.values(USER_GENDER);

export class CreateUserRequestDto {
  @ApiProperty({ example: 'tuyennh' })
  @IsString()
  @IsNotEmpty({ message: 'Username không được để trống' })
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'tuyennh@gmail.com' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email không được để trống' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  @IsArray()
  roles: string[];

  @ApiProperty({ example: 'Tuyen@110695' })
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'Tuyen' })
  @IsString()
  @IsNotEmpty({ message: 'firstName không được để trống' })
  @MaxLength(50)
  firstName: string;

  @ApiPropertyOptional({ example: 'Nguyen Hoang' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Giới tính',
    enum: USER_GENDER_VALUES,
    example: USER_GENDER.MALE,
  })
  @IsEnum(USER_GENDER)
  @IsOptional()
  gender?: USER_GENDER;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  avatar?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0389838637' })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  birthday?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái User',
    enum: USER_STATUS_VALUES,
    example: USER_STATUS.ACTIVE,
  })
  @IsEnum(USER_STATUS)
  @IsOptional()
  status?: USER_STATUS;
}

/**
 * PATCH user: mọi field đều optional. Không nhận `password` (đổi password
 * qua endpoint riêng) và không nhận `status` (đi qua PATCH /users/:id/status).
 */
export class UpdateUserRequestDto {
  @ApiPropertyOptional({ example: 'tuyennh' })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Username không được để trống' })
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional({ example: 'tuyennh@gmail.com' })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: 'Tuyen' })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'firstName không được để trống' })
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Nguyen Hoang' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Giới tính',
    enum: USER_GENDER_VALUES,
    example: USER_GENDER.MALE,
  })
  @IsEnum(USER_GENDER)
  @IsOptional()
  gender?: USER_GENDER;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  avatar?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0389838637' })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  birthday?: string;
}

export class ChangeUserStatusRequestDto {
  @ApiProperty({ enum: USER_STATUS_VALUES, example: USER_STATUS.BLOCKED })
  @IsDefined({ message: 'status là bắt buộc' })
  @IsIn(USER_STATUS_VALUES)
  status: USER_STATUS;
}

export class GetUsersQueryDto {
  @IsOptional()
  @IsIn([FULL_INFO, LIST_INFO, SIMPLE_INFO])
  field?: INFO_TYPE;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: USER_STATUS_VALUES, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(USER_STATUS_VALUES, { each: true })
  status?: USER_STATUS[];

  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class GetUsersOffsetQueryDto extends IntersectionType(
  OffsetPaginationDto,
  GetUsersQueryDto,
) {}

export class GetUsersCursorQueryDto extends IntersectionType(
  UuidCursorPaginationDto,
  GetUsersQueryDto,
) {}
