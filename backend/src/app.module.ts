import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { UsersModule } from './presentation/http/users/users.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { AuthModule } from './presentation/http/auth/auth.module';
import { ChannelsModule } from './presentation/http/channels/channels.module';
import { MessagesModule } from './presentation/http/messages/messages.module';
import { ConversationsModule } from './presentation/http/conversations/conversations.module';
import { ChatModule } from './presentation/websocket/chat.module';
// import { APP_INTERCEPTOR } from '@nestjs/core/constants';
// import { LoggingInterceptor } from './presentation/interceptors/logging.interceptor';
// import { ResponseInterceptor } from './presentation/interceptors/response.interceptor';

@Module({
  // imports: [PrismaModule, UsersModule, LoggerModule],
  imports: [
    PrismaModule,
    LoggerModule,
    MailModule,
    UsersModule,
    AuthModule,
    ChannelsModule,
    MessagesModule,
    ConversationsModule,
    ChatModule,
  ],
})
export class AppModule {}
