import { User as PrismaUser } from '../../../../generated/prisma/client.js';
import { UserEntity, Role } from '../../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): UserEntity {
    return new UserEntity({
      id: prismaUser.id,
      username: prismaUser.username,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      avatarUrl: prismaUser.avatarUrl,
      role: prismaUser.role as Role,
      isOnline: prismaUser.isOnline,
      isEmailVerified: prismaUser.isEmailVerified,
      lastSeenAt: prismaUser.lastSeenAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  static toPrisma(user: UserEntity) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isOnline: user.isOnline,
      isEmailVerified: user.isEmailVerified,
      lastSeenAt: user.lastSeenAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toResponse(user: UserEntity) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isOnline: user.isOnline,
      isEmailVerified: user.isEmailVerified,
      lastSeenAt: user.lastSeenAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
