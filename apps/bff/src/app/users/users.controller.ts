import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDto } from '@ecosystem/interfaces';
import { Authorization } from '../common/decorators/authorizer.decotator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Authorization({ secured: true })
  @Post('create')
  createUser(@Body() createUserDto: CreateUserRequestDto) {
    return this.usersService.create(createUserDto);
  }
}
