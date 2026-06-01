import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  Req,
  Query,
} from '@nestjs/common';
import { CreateChannelUseCase } from '../../../application/use-cases/channels/create-channel.usecase';
import { GetChannelsUseCase } from '../../../application/use-cases/channels/get-channels.usecase';
import { GetChannelUseCase } from '../../../application/use-cases/channels/get-channel.usecase';
import { UpdateChannelUseCase } from '../../../application/use-cases/channels/update-channel.usecase';
import { DeleteChannelUseCase } from '../../../application/use-cases/channels/delete-channel.usecase';
import { JoinChannelUseCase } from '../../../application/use-cases/channels/join-channel.usecase';
import { LeaveChannelUseCase } from '../../../application/use-cases/channels/leave-channel.usecase';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { ChannelMapper } from '../../../infrastructure/prisma/mappers/channel.mapper';
import { Auth } from '../decorators/auth.decorator';
import { Role, UserEntity } from '../../../domain/entities/user.entity';
import type { Request } from 'express';
import { GetChannelsDto } from './dtos/get-channels.dto';
import { Public } from '../decorators/public.decorator';

@Auth()
@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly createChannelUseCase: CreateChannelUseCase,
    private readonly getChannelsUseCase: GetChannelsUseCase,
    private readonly getChannelUseCase: GetChannelUseCase,
    private readonly updateChannelUseCase: UpdateChannelUseCase,
    private readonly deleteChannelUseCase: DeleteChannelUseCase,
    private readonly joinChannelUseCase: JoinChannelUseCase,
    private readonly leaveChannelUseCase: LeaveChannelUseCase,
  ) {}

  @Post()
  async createChannel(@Body() dto: CreateChannelDto, @Req() req: Request) {
    const user = req.user as UserEntity;
    const channel = await this.createChannelUseCase.execute({
      name: dto.name,
      description: dto.description ?? null,
      isPrivate: dto.isPrivate ?? false,
      createdById: user.id,
    });
    return ResponseInterceptor.success(
      ChannelMapper.toResponse(channel),
      'Canal creado exitosamente',
    );
  }

  @Public()
  @Get()
  async getChannels(@Query() query: GetChannelsDto) {
    const result = await this.getChannelsUseCase.execute(query);
    return ResponseInterceptor.success(
      { ...result, data: result.data.map(ChannelMapper.toResponse) },
      'Canales obtenidos exitosamente',
    );
  }

  @Public()
  @Get(':id')
  async getChannel(@Param('id', ParseUUIDPipe) id: string) {
    const channel = await this.getChannelUseCase.execute(id);
    return ResponseInterceptor.success(
      ChannelMapper.toResponse(channel),
      'Canal obtenido exitosamente',
    );
  }

  @Patch(':id')
  async updateChannel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChannelDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const channel = await this.updateChannelUseCase.execute({
      id,
      requesterId: user.id,
      ...dto,
    });
    return ResponseInterceptor.success(
      ChannelMapper.toResponse(channel),
      'Canal actualizado exitosamente',
    );
  }

  // @Delete(':id')
  // async deleteChannel(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Req() req: Request,
  // ) {
  //   const user = req.user as UserEntity;
  //   await this.deleteChannelUseCase.execute({ id, requesterId: user.id });
  //   return ResponseInterceptor.success(null, 'Canal eliminado exitosamente');
  // }

  @Delete(':id')
  async deleteChannel(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    await this.deleteChannelUseCase.execute({
      id,
      requesterId: user.id,
      requesterRole: user.role,
    });
    return ResponseInterceptor.success(null, 'Canal eliminado exitosamente');
  }

  @Post(':id/join')
  async joinChannel(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const member = await this.joinChannelUseCase.execute({
      channelId: id,
      userId: user.id,
    });
    return ResponseInterceptor.success(
      member,
      'Te uniste al canal exitosamente',
    );
  }

  @Delete(':id/leave')
  async leaveChannel(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    await this.leaveChannelUseCase.execute({ channelId: id, userId: user.id });
    return ResponseInterceptor.success(
      null,
      'Abandonaste el canal exitosamente',
    );
  }
}
