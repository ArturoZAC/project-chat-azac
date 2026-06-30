import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { GetUsersUseCase } from '../../../application/use-cases/users/get-users.usecase';
import { GetUserUseCase } from '../../../application/use-cases/users/get-user.usecase';
import { UpdateUserUseCase } from '../../../application/use-cases/users/update-user.usecase';
import { DeleteUserUseCase } from '../../../application/use-cases/users/delete-user.usecase';
import { GetUsersDto } from './dtos/get-users.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { UserMapper } from '../../../infrastructure/prisma/mappers/user.mapper';
// import { JwtAuthGuard } from '../guards/jwt-auth.guard';
// import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../../../domain/entities/user.entity';
// import { Roles } from '../decorators/roles.decorator';
import { Auth } from '../decorators/auth.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
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
