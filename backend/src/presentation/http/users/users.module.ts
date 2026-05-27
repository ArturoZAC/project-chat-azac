import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { GetUsersUseCase } from '../../../application/use-cases/users/get-users.usecase';
import { GetUserUseCase } from '../../../application/use-cases/users/get-user.usecase';
import { UpdateUserUseCase } from '../../../application/use-cases/users/update-user.usecase';
import { DeleteUserUseCase } from '../../../application/use-cases/users/delete-user.usecase';

@Module({
  controllers: [UsersController],
  providers: [
    GetUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UsersModule {}
