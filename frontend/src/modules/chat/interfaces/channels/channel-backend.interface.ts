/** Raw type returned by ChannelMapper.toResponse on the backend */
export interface ChannelBackend {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  membersCount: number;
}
