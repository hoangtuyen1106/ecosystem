import { USER_GENDER, USER_STATUS } from '@ecosystem/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'tuyennh' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'tuyennh@gmail.com' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: 'Tuyen@110695' })
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'Tuyen' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Nguyen Hoang' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Giới tính',
    example: 'MALE',
    enum: USER_GENDER,
  })
  @IsEnum(USER_GENDER)
  @IsOptional()
  gender?: USER_GENDER;

  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại',
  })
  @IsOptional()
  @IsPhoneNumber('VN')
  @ApiPropertyOptional({
    description: 'Số điện thoạn',
    example: '0389838637',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh',
  })
  @IsOptional()
  @IsString()
  birthday?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái User',
    enum: USER_STATUS,
    example: USER_STATUS.ACTIVE,
  })
  @IsEnum(USER_STATUS)
  @IsOptional()
  status: USER_STATUS;
}

export class UpdateUserInput {
  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Giới tính',
    example: 'MALE',
    enum: USER_GENDER,
  })
  @IsEnum(USER_GENDER)
  @IsOptional()
  gender?: USER_GENDER;

  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh',
  })
  @IsOptional()
  @IsString()
  birthday?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái User',
    enum: USER_STATUS,
    example: USER_STATUS.ACTIVE,
  })
  @IsEnum(USER_STATUS)
  @IsOptional()
  status?: USER_STATUS;
}
