export interface ConversationEntityProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ConversationEntity {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: ConversationEntityProps) {
    this.id = props.id;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
