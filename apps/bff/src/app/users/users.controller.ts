import { USER_STATUS } from '@ecosystem/constants';
import {
  ChangeUserStatusRequestDto,
  CreateUserRequestDto,
  GetUsersCursorQueryDto,
  GetUsersOffsetQueryDto,
  ResponseDto,
  UpdateUserRequestDto,
  UserListCursorTcpResponse,
  UserListOffsetTcpResponse,
  UserResponseDto,
} from '@ecosystem/interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from '../common/decorators/authorizer.decotator';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Authorization({ secured: true })
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiOkResponse({ type: ResponseDto<UserResponseDto> })
  create(@Body() body: CreateUserRequestDto) {
    return this.usersService.create(body);
  }

  @Authorization({ secured: true })
  @Get()
  @ApiOperation({ summary: 'Get all users (offset pagination)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: USER_STATUS,
    isArray: true,
  })
  @ApiOkResponse({ type: ResponseDto<UserListOffsetTcpResponse> })
  findAll(@Query() query: GetUsersOffsetQueryDto) {
    return this.usersService.findAll(query);
  }

  @Authorization({ secured: true })
  @Get('cursor')
  @ApiOperation({ summary: 'Get all users (cursor pagination)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: USER_STATUS,
    isArray: true,
  })
  @ApiOkResponse({ type: ResponseDto<UserListCursorTcpResponse> })
  findAllCursor(@Query() query: GetUsersCursorQueryDto) {
    return this.usersService.findAllCursor(query);
  }

  @Authorization({ secured: true })
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ResponseDto<UserResponseDto> })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Authorization({ secured: true })
  @Patch(':id')
  @ApiOperation({ summary: 'Update user (profile fields only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ResponseDto<UserResponseDto> })
  update(@Param('id') id: string, @Body() body: UpdateUserRequestDto) {
    return this.usersService.update(id, body);
  }

  @Authorization({ secured: true })
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ResponseDto<string> })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Authorization({ secured: true })
  @Patch(':id/status')
  @ApiOperation({ summary: 'Change user status' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ResponseDto<UserResponseDto> })
  changeStatus(
    @Param('id') id: string,
    @Body() body: ChangeUserStatusRequestDto,
  ) {
    return this.usersService.changeStatus(id, body);
  }
}
