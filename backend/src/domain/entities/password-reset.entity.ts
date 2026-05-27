//prettier-ignore
export interface PasswordResetEntityProps {
  id       : string;
  token    : string;
  expiresAt: Date;
  usedAt   : Date | null;
  createdAt: Date;
  userId   : string;
}

//prettier-ignore
export class PasswordResetEntity {
  public id       : string;
  public token    : string;
  public expiresAt: Date;
  public usedAt   : Date | null;
  public createdAt: Date;
  public userId   : string;

  constructor(props: PasswordResetEntityProps) {
    this.id        = props.id;
    this.token     = props.token;
    this.expiresAt = props.expiresAt;
    this.usedAt    = props.usedAt;
    this.createdAt = props.createdAt;
    this.userId    = props.userId;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }
}
