export enum ChannelMemberRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface ChannelMemberEntityProps {
  id: string;
  role: ChannelMemberRole;
  joinedAt: Date;
  lastReadAt: Date | null;
  channelId: string;
  userId: string;
}

export class ChannelMemberEntity {
  public id: string;
  public role: ChannelMemberRole;
  public joinedAt: Date;
  public lastReadAt: Date | null;
  public channelId: string;
  public userId: string;

  constructor(props: ChannelMemberEntityProps) {
    this.id = props.id;
    this.role = props.role;
    this.joinedAt = props.joinedAt;
    this.lastReadAt = props.lastReadAt;
    this.channelId = props.channelId;
    this.userId = props.userId;
  }
}
