import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { GetUsersUseCase } from '../../../application/use-cases/users/get-users.usecase';
import { GetUserUseCase } from '../../../application/use-cases/users/get-user.usecase';
import { UpdateUserUseCase } from '../../../application/use-cases/users/update-user.usecase';
import { DeleteUserUseCase } from '../../../application/use-cases/users/delete-user.usecase';
import { GetUserChannelsUseCase } from '../../../application/use-cases/users/get-user-channels.usecase';
import { GetUserActivityUseCase } from '../../../application/use-cases/users/get-user-activity.usecase';

@Module({
  controllers: [UsersController],
  providers: [
    GetUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUserChannelsUseCase,
    GetUserActivityUseCase,
  ],
})
export class UsersModule {}
