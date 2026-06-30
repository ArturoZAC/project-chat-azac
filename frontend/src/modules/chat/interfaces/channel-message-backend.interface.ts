/** Raw type returned by MessageMapper.toResponse on the backend */
export interface ChannelMessageBackend {
  id: string;
  content: string;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  channelId: string;
  conversationId: string | null;
  senderId: string;
  parentId: string | null;
}
