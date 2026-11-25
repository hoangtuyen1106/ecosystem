import { ROLE_STATUS } from '@ecosystem/constants';
import { UserData } from '@ecosystem/decorators';
import {
  AuthMetaData,
  ChangeRoleStatusRequestDto,
  CreateRoleRequestDto,
  GetRolesCursorQueryDto,
  GetRolesOffsetQueryDto,
  ResponseDto,
  RoleListCursorTcpResponse,
  RoleListOffsetTcpResponse,
  RoleResponseDto,
  SetRolePermissionsRequestDto,
  UpdateRoleRequestDto,
} from '@ecosystem/interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
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
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);
  constructor(private readonly rolesService: RolesService) {}

  @Authorization({ secured: true })
  @Post()
  @ApiOperation({ summary: 'Create role' })
  @ApiOkResponse({ type: ResponseDto<RoleResponseDto> })
  create(@Body() body: CreateRoleRequestDto) {
    return this.rolesService.create(body);
  }

  @Authorization({ secured: true })
  @Get()
  @ApiOperation({ summary: 'Get all roles (offset pagination)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ROLE_STATUS,
    isArray: true,
  })
  @ApiOkResponse({ type: ResponseDto<RoleListOffsetTcpResponse> })
  findAll(@Query() query: GetRolesOffsetQueryDto, @UserData() userData: AuthMetaData) {
    // Logger.debug('User data', userData);
    this.logger.debug('User data >>>>>>' + JSON.stringify(userData));
    return this.rolesService.findAll(query);
  }

  @Authorization({ secured: true })
  @Get('cursor')
  @ApiOperation({ summary: 'Get all roles (cursor pagination)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ROLE_STATUS,
    isArray: true,
  })
  @ApiOkResponse({ type: ResponseDto<RoleListCursorTcpResponse> })
  findAllCursor(@Query() query: GetRolesCursorQueryDto) {
    return this.rolesService.findAllCursor(query);
  }

  @Authorization({ secured: true })
  @Get(':id')
  @ApiOperation({ summary: 'Get role by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ResponseDto<RoleResponseDto> })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Authorization({ secured: true })
  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ResponseDto<RoleResponseDto> })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRoleRequestDto,
  ) {
    return this.rolesService.update(id, body);
  }

  @Authorization({ secured: true })
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete role' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ResponseDto<string> })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  @Authorization({ secured: true })
  @Patch(':id/status')
  @ApiOperation({ summary: 'Change role status (enable/disable)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ResponseDto<RoleResponseDto> })
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ChangeRoleStatusRequestDto,
  ) {
    return this.rolesService.changeStatus(id, body);
  }

  @Authorization({ secured: true })
  @Put(':id/permissions')
  @ApiOperation({ summary: 'Replace role permissions' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ResponseDto<RoleResponseDto> })
  setPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SetRolePermissionsRequestDto,
  ) {
    return this.rolesService.setPermissions(id, body);
  }
}
