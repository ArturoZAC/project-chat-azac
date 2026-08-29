import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../domain/repositories/user.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { ChannelMemberRepository } from '../../domain/repositories/channel-member.repository';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { ChannelRepository } from '../../domain/repositories/channel.repository';
import { ChannelEntity } from '../../domain/entities/channel.entity';
import { MessageMapper } from '../../infrastructure/prisma/mappers/message.mapper';
import { UserMapper } from '../../infrastructure/prisma/mappers/user.mapper';
import { envs } from 'src/config/envs';

@WebSocketGateway({
  cors: {
    origin: envs.CLIENT_URL,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  /** Track online users in-memory so new clients get the full list on connect */
  private onlineUsers = new Map<string, { userId: string; username: string }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly messageRepo: MessageRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
    private readonly conversationRepo: ConversationRepository,
    private readonly channelRepo: ChannelRepository,
  ) {}

  // private async getUserFromSocket(client: Socket) {
  //   try {
  //     const token =
  //       client.handshake.auth?.token ||
  //       client.handshake.headers?.authorization?.split(' ')[1];
  //     if (!token) return null;
  //     const payload = this.jwtService.verify(token);
  //     return await this.userRepo.findById(payload.id);
  //   } catch {
  //     return null;
  //   }
  // }

  private async getUserFromSocket(client: Socket) {
    try {
      const cookieHeader = client.handshake.headers?.cookie;
      // console.log('COOKIE HEADER:', cookieHeader);

      if (!cookieHeader) return null;

      const cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => {
          const [key, ...val] = c.trim().split('=');
          return [key, val.join('=')];
        }),
      );

      // console.log('PARSED COOKIES:', cookies);

      const token = cookies['token'];
      // console.log('TOKEN:', token);

      if (!token) return null;

      const payload = this.jwtService.verify(token);
      // console.log('PAYLOAD:', payload);

      return await this.userRepo.findById(payload.id);
    } catch {
      // console.log('ERROR:', e);
      return null;
    }
  }

  async handleConnection(client: Socket) {
    // console.log('CLIENT CONNECTED:', client.id);
    // console.log('HANDSHAKE HEADERS:', client.handshake.headers);
    // console.log('HANDSHAKE AUTH:', client.handshake.auth);
    const user = await this.getUserFromSocket(client);
    // console.log('USER FROM SOCKET:', user);
    if (!user) {
      // console.log('NO USER FOUND - DISCONNECTING');
      client.disconnect();
      return;
    }

    client.data.user = user;
    client.join(`user:${user.id}`);

    await this.userRepo.update({
      ...user,
      isOnline: true,
      lastSeenAt: new Date(),
    });

    // Add to in-memory online set
    this.onlineUsers.set(user.id, { userId: user.id, username: user.username });

    // Tell other clients that this user came online
    client.broadcast.emit('user.online', {
      userId: user.id,
      username: user.username,
    });
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (!user) return;

    // Remove from in-memory online set
    this.onlineUsers.delete(user.id);

    await this.userRepo.update({
      ...user,
      isOnline: false,
      lastSeenAt: new Date(),
    });

    this.server.emit('user.offline', {
      userId: user.id,
      username: user.username,
      lastSeenAt: new Date(),
    });
  }

  // @SubscribeMessage('channel.join')
  // async handleJoinChannel(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { channelId: string },
  // ) {
  //   const user = client.data.user;
  //   if (!user) return;

  //   const member = await this.channelMemberRepo.findByChannelAndUser(
  //     data.channelId,
  //     user.id,
  //   );
  //   if (!member) return;

  //   client.join(`channel:${data.channelId}`);

  //   this.server.to(`channel:${data.channelId}`).emit('channel.joined', {
  //     channelId: data.channelId,
  //     userId: user.id,
  //     username: user.username,
  //   });
  // }

  @SubscribeMessage('channel.join')
  async handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    const user = client.data.user;
    // console.log(
    //   'CHANNEL JOIN - user:',
    //   user?.username,
    //   'channelId:',
    //   data.channelId,
    // );

    if (!user) {
      // console.log('NO USER');
      return;
    }

    const member = await this.channelMemberRepo.findByChannelAndUser(
      data.channelId,
      user.id,
    );
    // console.log('MEMBER:', member);

    if (!member) {
      // console.log('NOT A MEMBER');
      return;
    }

    client.join(`channel:${data.channelId}`);
    // console.log('JOINED ROOM:', `channel:${data.channelId}`);
    // console.log('ROOMS:', client.rooms);

    this.server.to(`channel:${data.channelId}`).emit('channel.joined', {
      channelId: data.channelId,
      userId: user.id,
      username: user.username,
    });
    // console.log('EMITTED channel.joined');
  }

  @SubscribeMessage('message.send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { channelId: string; content: string; parentId?: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    const member = await this.channelMemberRepo.findByChannelAndUser(
      data.channelId,
      user.id,
    );
    if (!member) return;

    const message = await this.messageRepo.create({
      content: data.content,
      channelId: data.channelId,
      senderId: user.id,
      parentId: data.parentId ?? null,
    });

    this.server.to(`channel:${data.channelId}`).emit('message.sent', {
      ...MessageMapper.toResponse(message),
      sender: UserMapper.toResponse(user),
    });

    // Emit channel.updated + notification to all channel members except sender
    const channelMembers = await this.channelMemberRepo.findByChannel(
      data.channelId,
    );
    const channelName =
      (await this.channelRepo.findById(data.channelId))?.name ?? data.channelId;

    for (const member of channelMembers) {
      if (member.userId === user.id) continue;

      this.server
        .to(`user:${member.userId}`)
        .emit('channel.updated', { channelId: data.channelId });

      this.server.to(`user:${member.userId}`).emit('notification.new', {
        id: message.id,
        type: 'channel',
        title: `#${channelName}`,
        message: 'te escribió un mensaje',
        channelName: channelName,
        channelId: data.channelId,
        conversationId: null,
        senderId: user.id,
        senderUsername: user.username,
        createdAt: message.createdAt,
      });
    }
  }

  @SubscribeMessage('message.edit')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    const message = await this.messageRepo.findById(data.messageId);
    if (!message || message.senderId !== user.id) return;

    const updated = await this.messageRepo.update(data.messageId, {
      content: data.content,
    });

    this.server.to(`channel:${updated.channelId}`).emit('message.edited', {
      ...MessageMapper.toResponse(updated),
      sender: UserMapper.toResponse(user),
    });
  }

  @SubscribeMessage('message.delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    const message = await this.messageRepo.findById(data.messageId);
    if (!message || message.senderId !== user.id) return;

    await this.messageRepo.delete(data.messageId);

    this.server.to(`channel:${message.channelId}`).emit('message.deleted', {
      messageId: data.messageId,
      channelId: message.channelId,
    });
  }

  @SubscribeMessage('request.online.list')
  handleRequestOnlineList(@ConnectedSocket() client: Socket) {
    client.emit('user.online.list', Array.from(this.onlineUsers.values()));
  }

  @SubscribeMessage('conversation.join')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    const isMember = await this.conversationRepo.isMember(
      data.conversationId,
      user.id,
    );
    if (!isMember) return;

    client.join(`conversation:${data.conversationId}`);

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('conversation.joined', {
        conversationId: data.conversationId,
        userId: user.id,
        username: user.username,
      });
  }

  @SubscribeMessage('conversation.message.send')
  async handleSendConversationMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { conversationId: string; content: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    const isMember = await this.conversationRepo.isMember(
      data.conversationId,
      user.id,
    );
    if (!isMember) return;

    const message = await this.messageRepo.create({
      content: data.content,
      conversationId: data.conversationId,
      senderId: user.id,
    });

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('conversation.message.sent', {
        ...MessageMapper.toResponse(message),
        sender: UserMapper.toResponse(user),
      });

    // Notify the conversation list to refresh (last message, timestamp)
    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('conversation.updated', {
        conversationId: data.conversationId,
      });

    // Emit notification to the other participant
    const participants = await this.conversationRepo.findParticipants(
      data.conversationId,
    );
    const otherParticipantId = participants.find((id) => id !== user.id);

    if (otherParticipantId) {
      this.server.to(`user:${otherParticipantId}`).emit('notification.new', {
        id: message.id,
        type: 'dm',
        title: user.username,
        message: 'te envió un mensaje',
        channelName: null,
        channelId: null,
        conversationId: data.conversationId,
        senderId: user.id,
        senderUsername: user.username,
        createdAt: message.createdAt,
      });
    }
  }

  @SubscribeMessage('conversation.message.edit')
  async handleEditConversationMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { conversationId: string; messageId: string; content: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    const message = await this.messageRepo.findById(data.messageId);
    if (!message || message.senderId !== user.id) return;
    if (message.conversationId !== data.conversationId) return;

    const updated = await this.messageRepo.update(data.messageId, {
      content: data.content,
    });

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('conversation.message.edited', {
        ...MessageMapper.toResponse(updated),
        sender: UserMapper.toResponse(user),
      });
  }

  @SubscribeMessage('conversation.message.delete')
  async handleDeleteConversationMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { conversationId: string; messageId: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    const message = await this.messageRepo.findById(data.messageId);
    if (!message || message.senderId !== user.id) return;
    if (message.conversationId !== data.conversationId) return;

    await this.messageRepo.delete(data.messageId);

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('conversation.message.deleted', {
        messageId: data.messageId,
        conversationId: data.conversationId,
      });
  }
}
