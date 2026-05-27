//prettier-ignore
export interface EmailVerificationEntityProps {
  id       : string;
  token    : string;
  expiresAt: Date;
  createdAt: Date;
  userId   : string;
}

//prettier-ignore
export class EmailVerificationEntity {
  public id       : string;
  public token    : string;
  public expiresAt: Date;
  public createdAt: Date;
  public userId   : string;

  constructor(props: EmailVerificationEntityProps) {
    this.id        = props.id;
    this.token     = props.token;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.userId    = props.userId;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
