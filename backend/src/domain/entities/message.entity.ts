export interface MessageEntityProps {
  id: string;
  content: string;
  isSystem: boolean;
  isEdited: boolean;
  editedAt: Date | null;
  createdAt: Date;
  channelId: string | null;
  conversationId: string | null;
  senderId: string;
  parentId: string | null;
  senderUsername: string;
  senderAvatarUrl: string | null;
}

export class MessageEntity {
  public id: string;
  public content: string;
  public isSystem: boolean;
  public isEdited: boolean;
  public editedAt: Date | null;
  public createdAt: Date;
  public channelId: string | null;
  public conversationId: string | null;
  public senderId: string;
  public parentId: string | null;
  public senderUsername: string;
  public senderAvatarUrl: string | null;

  constructor(props: MessageEntityProps) {
    this.id = props.id;
    this.content = props.content;
    this.isSystem = props.isSystem;
    this.isEdited = props.isEdited;
    this.editedAt = props.editedAt;
    this.createdAt = props.createdAt;
    this.channelId = props.channelId;
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.parentId = props.parentId;
    this.senderUsername = props.senderUsername;
    this.senderAvatarUrl = props.senderAvatarUrl;
  }
}
