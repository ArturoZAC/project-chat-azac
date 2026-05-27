import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';

export interface UpdateUserParams {
  id: string;
  username?: string;
  avatarUrl?: string;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(params: UpdateUserParams): Promise<UserEntity> {
    const user = await this.userRepo.findById(params.id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (params.username) {
      const exists = await this.userRepo.findByUsername(params.username);
      if (exists && exists.id !== params.id) {
        throw new ConflictException('Username ya está en uso');
      }
      user.username = params.username;
    }

    if (params.avatarUrl !== undefined) user.avatarUrl = params.avatarUrl;

    return this.userRepo.update(user);
  }
}
