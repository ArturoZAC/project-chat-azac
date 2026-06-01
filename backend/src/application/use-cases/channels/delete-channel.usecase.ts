// import {
//   Injectable,
//   NotFoundException,
//   // ForbiddenException,
// } from '@nestjs/common';
// import { ChannelRepository } from '../../../domain/repositories/channel.repository';

// export interface DeleteChannelParams {
//   id: string;
//   requesterId: string;
// }

// @Injectable()
// export class DeleteChannelUseCase {
//   constructor(private readonly channelRepo: ChannelRepository) {}

//   async execute(params: DeleteChannelParams): Promise<void> {
//     const channel = await this.channelRepo.findById(params.id);
//     if (!channel) throw new NotFoundException('Canal no encontrado');

//     // if (channel.createdById !== params.requesterId)
//     //   throw new ForbiddenException(
//     //     'No tienes permiso para eliminar este canal',
//     //   );

//     await this.channelRepo.delete(params.id);
//   }
// }

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { Role } from '../../../domain/entities/user.entity';

export interface DeleteChannelParams {
  id: string;
  requesterId: string;
  requesterRole: Role;
}

@Injectable()
export class DeleteChannelUseCase {
  constructor(private readonly channelRepo: ChannelRepository) {}

  async execute(params: DeleteChannelParams): Promise<void> {
    const channel = await this.channelRepo.findById(params.id);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    const isAdmin = params.requesterRole === Role.ADMIN;
    const isCreator = channel.createdById === params.requesterId;

    if (!isAdmin && !isCreator)
      throw new ForbiddenException(
        'No tienes permiso para eliminar este canal',
      );

    await this.channelRepo.delete(params.id);
  }
}
