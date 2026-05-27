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
import { GetUsersDto } from './dtos/get-users.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';

@Controller('users')
export class UsersController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  async getUsers(@Query() query: GetUsersDto) {
    const data = await this.getUsersUseCase.execute(query);
    return ResponseInterceptor.success(data, 'Usuarios obtenidos exitosamente');
  }

  @Get(':id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.getUserUseCase.execute(id);
    return ResponseInterceptor.success(data, 'Usuario obtenido exitosamente');
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const data = await this.updateUserUseCase.execute({ id, ...dto });
    return ResponseInterceptor.success(
      data,
      'Usuario actualizado exitosamente',
    );
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUserUseCase.execute(id);
    return ResponseInterceptor.success(null, 'Usuario eliminado exitosamente');
  }
}
