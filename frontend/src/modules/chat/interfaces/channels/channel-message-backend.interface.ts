/** Raw type returned by MessageMapper.toResponse on the backend */
export interface ChannelMessageBackend {
  id: string;
  content: string;
  isSystem: boolean;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  channelId: string;
  conversationId: string | null;
  senderId: string;
  parentId: string | null;
  senderUsername: string;
  senderAvatarUrl: string | null;
}
