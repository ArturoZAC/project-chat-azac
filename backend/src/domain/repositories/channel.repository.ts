import { ChannelEntity } from '../entities/channel.entity';

export interface CreateChannelData {
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdById: string;
}

export interface UpdateChannelData {
  name?: string;
  description?: string | null;
  isPrivate?: boolean;
}

export interface ChannelPaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedChannels {
  data: ChannelEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class ChannelRepository {
  abstract create(data: CreateChannelData): Promise<ChannelEntity>;
  abstract findById(id: string): Promise<ChannelEntity | null>;
  abstract findByName(name: string): Promise<ChannelEntity | null>;
  abstract findAll(params: ChannelPaginationParams): Promise<PaginatedChannels>;
  abstract update(id: string, data: UpdateChannelData): Promise<ChannelEntity>;
  abstract delete(id: string): Promise<void>;
}
