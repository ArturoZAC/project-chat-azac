import { ChannelMember as PrismaChannelMember } from '../../../../generated/prisma';
import {
  ChannelMemberEntity,
  ChannelMemberRole,
} from '../../../domain/entities/channel-member.entity';
import { CreateChannelMemberData } from '../../../domain/repositories/channel-member.repository';

export class ChannelMemberMapper {
  static toDomain(prisma: PrismaChannelMember): ChannelMemberEntity {
    return new ChannelMemberEntity({
      id: prisma.id,
      role: prisma.role as ChannelMemberRole,
      joinedAt: prisma.joinedAt,
      lastReadAt: prisma.lastReadAt,
      channelId: prisma.channelId,
      userId: prisma.userId,
    });
  }

  static toPrisma(entity: ChannelMemberEntity) {
    return {
      id: entity.id,
      role: entity.role,
      joinedAt: entity.joinedAt,
      lastReadAt: entity.lastReadAt,
      channelId: entity.channelId,
      userId: entity.userId,
    };
  }

  static toCreatePrisma(data: CreateChannelMemberData) {
    return {
      channelId: data.channelId,
      userId: data.userId,
      role: data.role,
    };
  }

  static toResponse(entity: ChannelMemberEntity) {
    return {
      id: entity.id,
      role: entity.role,
      joinedAt: entity.joinedAt,
      lastReadAt: entity.lastReadAt,
      channelId: entity.channelId,
      userId: entity.userId,
    };
  }
}
