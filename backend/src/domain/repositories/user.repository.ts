import { RegisterDto } from '../../presentation/http/auth/dtos/register.dto';
import { UserEntity } from '../entities/user.entity';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class UserRepository {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByUsername(username: string): Promise<UserEntity | null>;
  abstract findAll(
    params: PaginationParams,
  ): Promise<PaginatedResult<UserEntity>>;
  // abstract create(user: UserEntity): Promise<UserEntity>;
  abstract create(
    dto: RegisterDto & { passwordHash: string },
  ): Promise<UserEntity>;
  abstract update(user: UserEntity): Promise<UserEntity>;
  abstract delete(id: string): Promise<void>;
}
