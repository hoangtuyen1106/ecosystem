import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus, UserGender } from '../.././../generated/prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserInput {
  @ApiProperty({ example: 'tuyennh' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'tuyennh@gmail.com' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsStrongPassword()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Giới tính'
  })
  @IsEnum(UserGender)
  gender?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại'
  })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh'
  })
  @IsOptional()
  @IsString()
  birthday?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái User'
  })
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserInput {
  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Giới tính'
  })
  @IsEnum(UserGender)
  gender?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh'
  })
  @IsOptional()
  @IsString()
  birthday?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái User'
  })
  @IsEnum(UserStatus)
  status: UserStatus;
}