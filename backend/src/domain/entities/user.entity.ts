export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

//prettier-ignore
export interface UserEntityProps {
  id             : string;
  username       : string;
  email          : string;
  passwordHash   : string;
  avatarUrl      : string | null;
  role           : Role;
  isOnline       : boolean;
  isEmailVerified: boolean;
  lastSeenAt     : Date | null;
  createdAt      : Date;
  updatedAt      : Date;
}

//prettier-ignore
export class UserEntity {
  public id             : string;
  public username       : string;
  public email          : string;
  public passwordHash   : string;
  public avatarUrl      : string | null;
  public role           : Role;
  public isOnline       : boolean;
  public isEmailVerified: boolean;
  public lastSeenAt     : Date | null;
  public createdAt      : Date;
  public updatedAt      : Date;

  constructor({
    id,
    username,
    email,
    passwordHash,
    avatarUrl,
    role,
    isOnline,
    isEmailVerified,
    lastSeenAt,
    createdAt,
    updatedAt,
  }: UserEntityProps) {
    this.id              = id;
    this.username        = username;
    this.email           = email;
    this.passwordHash    = passwordHash;
    this.avatarUrl       = avatarUrl;
    this.role            = role;
    this.isOnline        = isOnline;
    this.isEmailVerified = isEmailVerified;
    this.lastSeenAt      = lastSeenAt;
    this.createdAt       = createdAt;
    this.updatedAt       = updatedAt;
  }
}
