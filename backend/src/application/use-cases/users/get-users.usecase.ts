import { Injectable } from '@nestjs/common';
import {
  UserRepository,
  PaginationParams,
  PaginatedResult,
} from '../../../domain/repositories/user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';

@Injectable()
export class GetUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(
    params: PaginationParams,
  ): Promise<PaginatedResult<UserEntity>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(params.limit, 100);
    return this.userRepo.findAll({ page, limit });
  }
}
