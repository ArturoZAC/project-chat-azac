import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GetUsersUseCase } from '../../../application/use-cases/users/get-users.usecase';
import { GetUserUseCase } from '../../../application/use-cases/users/get-user.usecase';
import { UpdateUserUseCase } from '../../../application/use-cases/users/update-user.usecase';
import { DeleteUserUseCase } from '../../../application/use-cases/users/delete-user.usecase';
import { GetUserChannelsUseCase } from '../../../application/use-cases/users/get-user-channels.usecase';
import { GetUserActivityUseCase } from '../../../application/use-cases/users/get-user-activity.usecase';
import { GetUsersDto } from './dtos/get-users.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { UserMapper } from '../../../infrastructure/prisma/mappers/user.mapper';
import { Role } from '../../../domain/entities/user.entity';
import { Auth } from '../decorators/auth.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUserChannelsUseCase: GetUserChannelsUseCase,
    private readonly getUserActivityUseCase: GetUserActivityUseCase,
  ) {}

  @Get()
  @Auth()
  async getUsers(@Query() query: GetUsersDto) {
    const result = await this.getUsersUseCase.execute(query);
    return ResponseInterceptor.success(
      { ...result, data: result.data.map(UserMapper.toResponse) },
      'Usuarios obtenidos exitosamente',
    );
  }

  @Auth()
  @Get(':id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.getUserUseCase.execute(id);
    return ResponseInterceptor.success(
      UserMapper.toResponse(data),
      'Usuario obtenido exitosamente',
    );
  }

  @Auth()
  @Get(':id/channels')
  async getUserChannels(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.getUserChannelsUseCase.execute(id);
    return ResponseInterceptor.success(data, 'Canales obtenidos exitosamente');
  }

  @Auth()
  @Get(':id/activity')
  async getUserActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const now = new Date();
    const fromDate = from ? new Date(from) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(`${to}T23:59:59.999Z`) : now;
    const data = await this.getUserActivityUseCase.execute(id, fromDate, toDate);
    return ResponseInterceptor.success(data, 'Actividad obtenida exitosamente');
  }

  @Auth()
  @Patch(':id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const data = await this.updateUserUseCase.execute({ id, ...dto });
    return ResponseInterceptor.success(
      UserMapper.toResponse(data),
      'Usuario actualizado exitosamente',
    );
  }

  @Auth(Role.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUserUseCase.execute(id);
    return ResponseInterceptor.success(null, 'Usuario eliminado exitosamente');
  }
}
