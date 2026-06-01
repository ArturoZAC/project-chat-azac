export interface ChannelEntityProps {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChannelEntity {
  public id: string;
  public name: string;
  public description: string | null;
  public isPrivate: boolean;
  public createdById: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: ChannelEntityProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.isPrivate = props.isPrivate;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
