import { Channel as PrismaChannel } from '../../../../generated/prisma';
import { ChannelEntity } from '../../../domain/entities/channel.entity';
import { CreateChannelData } from '../../../domain/repositories/channel.repository';

export class ChannelMapper {
  static toDomain(prisma: PrismaChannel): ChannelEntity {
    return new ChannelEntity({
      id: prisma.id,
      name: prisma.name,
      description: prisma.description,
      isPrivate: prisma.isPrivate,
      createdById: prisma.createdById,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
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

  static toResponse(entity: ChannelEntity) {
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
}
