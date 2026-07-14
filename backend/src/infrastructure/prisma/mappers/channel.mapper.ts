import { Channel as PrismaChannel } from '../../../../generated/prisma';
import { ChannelEntity } from '../../../domain/entities/channel.entity';
import { CreateChannelData } from '../../../domain/repositories/channel.repository';

type PrismaChannelWithCount = PrismaChannel & {
  _count?: { members: number };
  createdBy?: { id: string; username: string };
};

export class ChannelMapper {
  static toDomain(prisma: PrismaChannel | PrismaChannelWithCount): ChannelEntity {
    const data = prisma as PrismaChannelWithCount;
    const count = data._count?.members ?? 0;
    return new ChannelEntity({
      id: data.id,
      name: data.name,
      description: data.description,
      isPrivate: data.isPrivate,
      createdById: data.createdById,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      membersCount: count,
      creator: data.createdBy ? { id: data.createdBy.id, username: data.createdBy.username } : null,
    });
  }

  static toPrisma(entity: ChannelEntity) {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      isPrivate: entity.isPrivate,
      createdById: entity.createdById,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toCreatePrisma(data: CreateChannelData) {
    return {
      name: data.name,
      description: data.description,
      isPrivate: data.isPrivate,
      createdById: data.createdById,
    };
  }

  static toResponse(
    entity: ChannelEntity,
    lastMessage?: {
      id: string;
      content: string;
      senderId: string;
      senderUsername: string;
      createdAt: Date;
    } | null,
  ) {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      isPrivate: entity.isPrivate,
      createdById: entity.createdById,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      membersCount: entity.membersCount,
      lastMessage: lastMessage ?? null,
      creator: entity.creator ?? null,
    };
  }
}
