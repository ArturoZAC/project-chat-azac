export interface ChannelInvitationEntityProps {
  id: string;
  token: string;
  channelId: string;
  createdById: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export class ChannelInvitationEntity {
  public id: string;
  public token: string;
  public channelId: string;
  public createdById: string;
  public expiresAt: Date;
  public usedAt: Date | null;
  public createdAt: Date;

  constructor(props: ChannelInvitationEntityProps) {
    this.id = props.id;
    this.token = props.token;
    this.channelId = props.channelId;
    this.createdById = props.createdById;
    this.expiresAt = props.expiresAt;
    this.usedAt = props.usedAt;
    this.createdAt = props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }
}
