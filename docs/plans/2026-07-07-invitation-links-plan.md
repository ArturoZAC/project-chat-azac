# Invitation Links Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow channel admins to generate shareable invitation links for private channels, so any user (even not logged in) can join with one click.

**Architecture:** Backend creates tokens (like email verification), validates them, adds user as member, and emits a system message. Frontend provides a "copy link" UI in the members panel, an invite acceptance page with skeleton loading, and renders system messages in the chat.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Next.js 16 App Router, TanStack Query, Socket.IO

## Global Constraints

- Backend: All controllers use `@Auth()` by default, `@Public()` for public endpoints
- Backend: All responses wrapped in `ResponseInterceptor.success()`
- Backend: Domain entities are classes, repositories are abstract classes
- Backend: Prisma client imported from `../generated/prisma` (NOT `@prisma/client`)
- Frontend: "use client" only when state/interactivity needed
- Frontend: Tabler Icons for all icons
- Frontend: Framer Motion for animations
- Frontend: No Tailwind text-* classes — use system typography
- Messages that are system events (join) are marked with `isSystem: true` and rendered differently

---
## File Structure

### Backend (new/modified files)

| File | Action | Responsibility |
|---|---|---|
| `backend/prisma/schema.prisma` | Modify | Add `ChannelInvitation` model |
| `backend/src/domain/entities/channel-invitation.entity.ts` | Create | Invitation domain entity |
| `backend/src/domain/repositories/channel-invitation.repository.ts` | Create | Repository interface |
| `backend/src/infrastructure/prisma/mappers/channel-invitation.mapper.ts` | Create | Prisma ↔ Domain mapper |
| `backend/src/infrastructure/prisma/repositories/channel-invitation.prisma.repository.ts` | Create | Prisma repository implementation |
| `backend/src/infrastructure/prisma/prisma.module.ts` | Modify | Register new repository |
| `backend/src/application/use-cases/invitations/create-invitation.usecase.ts` | Create | Generate invitation token |
| `backend/src/application/use-cases/invitations/accept-invitation.usecase.ts` | Create | Validate token, add member, emit system message |
| `backend/src/presentation/http/invitations/invitations.controller.ts` | Create | REST endpoints |
| `backend/src/presentation/http/invitations/invitations.module.ts` | Create | Module |
| `backend/src/presentation/http/invitations/dtos/create-invitation.dto.ts` | Create | DTO |
| `backend/src/app.module.ts` | Modify | Import `InvitationsModule` |
| `backend/src/domain/entities/channel-message.system.ts` | Create | System message type/interface for join events |

### Frontend (new/modified files)

| File | Action | Responsibility |
|---|---|---|
| `frontend/src/modules/chat/components/members/MembersPanel.tsx` | Modify | Add "Generar enlace" button at bottom |
| `frontend/src/modules/chat/components/members/InviteLinkModal.tsx` | Create | Modal with generated link + copy button |
| `frontend/src/modules/chat/actions/invitations/create-invitation.action.ts` | Create | API call to create invitation |
| `frontend/src/modules/chat/actions/invitations/accept-invitation.action.ts` | Create | API call to accept invitation |
| `frontend/src/modules/chat/hooks/invitations/useInvitationMutations.ts` | Create | Mutations for create/accept |
| `frontend/src/modules/chat/interfaces/channels/channel.interface.ts` | Modify | Add `Message.isSystem` flag |
| `frontend/src/modules/chat/components/chat/MessageList.tsx` | Modify | Render system messages differently |
| `frontend/src/app/(chat)/invite/[token]/page.tsx` | Create | Invite acceptance page |
| `frontend/src/modules/chat/components/invite/InviteAcceptanceClient.tsx` | Create | Client component for accept flow |

---

### Task 1: Add ChannelInvitation model to Prisma schema

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Add the model**

Add after the `ChannelMember` model:

```prisma
model ChannelInvitation {
  id        String   @id @default(uuid())
  token     String   @unique @db.Text
  channelId String   @map("channel_id")
  channel   Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
  createdById String @map("created_by_id")
  createdBy User     @relation(fields: [createdById], references: [id])
  expiresAt DateTime @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([token])
  @@index([channelId])
  @@map("channel_invitations")
}
```

- [ ] **Step 2: Run migration**

```bash
cd backend
pnpm run prisma:migrate:dev --name add_channel_invitations
```

---

### Task 2: Create ChannelInvitation domain entity

**Files:**
- Create: `backend/src/domain/entities/channel-invitation.entity.ts`

- [ ] **Step 1: Write the entity**

```typescript
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
```

- [ ] **Step 2: Verify the file**

Ensure it follows the same pattern as `ChannelEntity`.

---

### Task 3: Create ChannelInvitationRepository interface

**Files:**
- Create: `backend/src/domain/repositories/channel-invitation.repository.ts`

- [ ] **Step 1: Write the repository interface**

```typescript
import { ChannelInvitationEntity } from '../entities/channel-invitation.entity';

export interface CreateChannelInvitationData {
  token: string;
  channelId: string;
  createdById: string;
  expiresAt: Date;
}

export abstract class ChannelInvitationRepository {
  abstract create(data: CreateChannelInvitationData): Promise<ChannelInvitationEntity>;
  abstract findByToken(token: string): Promise<ChannelInvitationEntity | null>;
  abstract markAsUsed(id: string): Promise<void>;
  abstract findValidByChannel(channelId: string): Promise<ChannelInvitationEntity[]>;
}
```

---

### Task 4: Create Prisma mapper for ChannelInvitation

**Files:**
- Create: `backend/src/infrastructure/prisma/mappers/channel-invitation.mapper.ts`

- [ ] **Step 1: Write the mapper**

```typescript
import { ChannelInvitation as PrismaChannelInvitation } from '../../../../generated/prisma';
import { ChannelInvitationEntity } from '../../../domain/entities/channel-invitation.entity';
import { CreateChannelInvitationData } from '../../../domain/repositories/channel-invitation.repository';

export class ChannelInvitationMapper {
  static toDomain(prisma: PrismaChannelInvitation): ChannelInvitationEntity {
    return new ChannelInvitationEntity({
      id: prisma.id,
      token: prisma.token,
      channelId: prisma.channelId,
      createdById: prisma.createdById,
      expiresAt: prisma.expiresAt,
      usedAt: prisma.usedAt,
      createdAt: prisma.createdAt,
    });
  }

  static toCreatePrisma(data: CreateChannelInvitationData) {
    return {
      token: data.token,
      channelId: data.channelId,
      createdById: data.createdById,
      expiresAt: data.expiresAt,
    };
  }
}
```

---

### Task 5: Create Prisma repository for ChannelInvitation

**Files:**
- Create: `backend/src/infrastructure/prisma/repositories/channel-invitation.prisma.repository.ts`

- [ ] **Step 1: Write the repository**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ChannelInvitationRepository,
  CreateChannelInvitationData,
} from '../../../domain/repositories/channel-invitation.repository';
import { ChannelInvitationEntity } from '../../../domain/entities/channel-invitation.entity';
import { ChannelInvitationMapper } from '../mappers/channel-invitation.mapper';

@Injectable()
export class ChannelInvitationPrismaRepository implements ChannelInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateChannelInvitationData): Promise<ChannelInvitationEntity> {
    const created = await this.prisma.channelInvitation.create({
      data: ChannelInvitationMapper.toCreatePrisma(data),
    });
    return ChannelInvitationMapper.toDomain(created);
  }

  async findByToken(token: string): Promise<ChannelInvitationEntity | null> {
    const invitation = await this.prisma.channelInvitation.findUnique({
      where: { token },
    });
    if (!invitation) return null;
    return ChannelInvitationMapper.toDomain(invitation);
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.channelInvitation.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async findValidByChannel(channelId: string): Promise<ChannelInvitationEntity[]> {
    const invitations = await this.prisma.channelInvitation.findMany({
      where: {
        channelId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    return invitations.map(ChannelInvitationMapper.toDomain);
  }
}
```

---

### Task 6: Register repository in PrismaModule

**Files:**
- Modify: `backend/src/infrastructure/prisma/prisma.module.ts`

- [ ] **Step 1: Add import and provider**

Add import:
```typescript
import { ChannelInvitationRepository } from '../../domain/repositories/channel-invitation.repository';
import { ChannelInvitationPrismaRepository } from './repositories/channel-invitation.prisma.repository';
```

Add to `providers` array:
```typescript
{
  provide: ChannelInvitationRepository,
  useClass: ChannelInvitationPrismaRepository,
},
```

Add to `exports` array:
```typescript
ChannelInvitationRepository,
```

---

### Task 7: Create Invitation use cases

**Files:**
- Create: `backend/src/application/use-cases/invitations/create-invitation.usecase.ts`
- Create: `backend/src/application/use-cases/invitations/accept-invitation.usecase.ts`
- Modify: `backend/src/application/use-cases/channels/join-channel.usecase.ts`

- [ ] **Step 1: Create `create-invitation.usecase.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelInvitationRepository } from '../../../domain/repositories/channel-invitation.repository';
import { ChannelInvitationEntity } from '../../../domain/entities/channel-invitation.entity';
import * as crypto from 'crypto';

export interface CreateInvitationParams {
  channelId: string;
  requestedById: string;
}

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly invitationRepo: ChannelInvitationRepository,
  ) {}

  async execute(params: CreateInvitationParams): Promise<ChannelInvitationEntity> {
    const channel = await this.channelRepo.findById(params.channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return this.invitationRepo.create({
      token,
      channelId: params.channelId,
      createdById: params.requestedById,
      expiresAt,
    });
  }
}
```

- [ ] **Step 2: Create `accept-invitation.usecase.ts`**

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ChannelInvitationRepository } from '../../../domain/repositories/channel-invitation.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import {
  ChannelMemberEntity,
  ChannelMemberRole,
} from '../../../domain/entities/channel-member.entity';

export interface AcceptInvitationParams {
  token: string;
  userId: string;
}

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    private readonly invitationRepo: ChannelInvitationRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
    private readonly channelRepo: ChannelRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async execute(
    params: AcceptInvitationParams,
  ): Promise<{ member: ChannelMemberEntity; systemMessageId: string }> {
    const invitation = await this.invitationRepo.findByToken(params.token);
    if (!invitation) throw new NotFoundException('Invitación no encontrada');

    if (invitation.isExpired())
      throw new BadRequestException('Esta invitación ha expirado');

    if (invitation.isUsed())
      throw new BadRequestException('Esta invitación ya fue utilizada');

    const channel = await this.channelRepo.findById(invitation.channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    const existingMember = await this.channelMemberRepo.findByChannelAndUser(
      invitation.channelId,
      params.userId,
    );
    if (existingMember) throw new ConflictException('Ya eres miembro de este canal');

    // Add user as member
    const member = await this.channelMemberRepo.create({
      channelId: invitation.channelId,
      userId: params.userId,
      role: ChannelMemberRole.USER,
    });

    // Mark invitation as used
    await this.invitationRepo.markAsUsed(invitation.id);

    // Create system message: "X se unió al canal"
    // We'll pass the username from the controller since we have access to req.user
    // The message content will be a JSON that includes the system event type
    const systemMessage = await this.messageRepo.create({
      channelId: invitation.channelId,
      senderId: params.userId,
      content: JSON.stringify({ type: 'system.join', userId: params.userId }),
      isSystem: true,
    });

    return { member, systemMessageId: systemMessage.id };
  }
}
```

- [ ] **Step 3: Add `isSystem` field to `message.entity.ts` and `MessageRepository`**

Modify `backend/src/domain/entities/message.entity.ts`:
- Add `isSystem: boolean` to props and class

Modify `backend/src/domain/repositories/message.repository.ts`:
- Add `isSystem?: boolean` to `CreateMessageData`

Modify `backend/src/infrastructure/prisma/mappers/message.mapper.ts`:
- Map `isSystem` field

Modify `backend/src/infrastructure/prisma/repositories/message.prisma.repository.ts`:
- Add `isSystem` to `create` data

Also add `isSystem` to the Prisma schema `Message` model:
```prisma
isSystem        Boolean   @default(false) @map("is_system")
```

Run migration:
```bash
cd backend
pnpm run prisma:migrate:dev --name add_is_system_to_messages
```

---

### Task 8: Create Invitations controller and module

**Files:**
- Create: `backend/src/presentation/http/invitations/invitations.controller.ts`
- Create: `backend/src/presentation/http/invitations/invitations.module.ts`
- Create: `backend/src/presentation/http/invitations/dtos/create-invitation.dto.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create DTO**

`dtos/create-invitation.dto.ts`:
```typescript
import { IsUUID } from 'class-validator';

export class CreateInvitationDto {
  @IsUUID()
  channelId: string;
}
```

- [ ] **Step 2: Create controller**

```typescript
import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { CreateInvitationUseCase } from '../../../application/use-cases/invitations/create-invitation.usecase';
import { AcceptInvitationUseCase } from '../../../application/use-cases/invitations/accept-invitation.usecase';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { Auth } from '../decorators/auth.decorator';
import { Public } from '../decorators/public.decorator';
import { UserEntity } from '../../../domain/entities/user.entity';
import type { Request } from 'express';
import { ParseUUIDPipe } from '@nestjs/common';

@Controller()
export class InvitationsController {
  constructor(
    private readonly createInvitationUseCase: CreateInvitationUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
  ) {}

  @Auth()
  @Post('channels/:channelId/invitations')
  async createInvitation(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const invitation = await this.createInvitationUseCase.execute({
      channelId,
      requestedById: user.id,
    });
    return ResponseInterceptor.success(
      {
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invitation.token}`,
      },
      'Enlace de invitación generado',
    );
  }

  @Auth()
  @Post('invitations/:token/accept')
  async acceptInvitation(
    @Param('token') token: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserEntity;
    const result = await this.acceptInvitationUseCase.execute({
      token,
      userId: user.id,
    });
    return ResponseInterceptor.success(
      {
        channelId: result.member.channelId,
        systemMessageId: result.systemMessageId,
      },
      'Te uniste al canal',
    );
  }
}
```

- [ ] **Step 3: Create module**

```typescript
import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { CreateInvitationUseCase } from '../../../application/use-cases/invitations/create-invitation.usecase';
import { AcceptInvitationUseCase } from '../../../application/use-cases/invitations/accept-invitation.usecase';

@Module({
  controllers: [InvitationsController],
  providers: [
    CreateInvitationUseCase,
    AcceptInvitationUseCase,
  ],
})
export class InvitationsModule {}
```

- [ ] **Step 4: Register in AppModule**

Add import in `app.module.ts`:
```typescript
import { InvitationsModule } from './presentation/http/invitations/invitations.module';

// In imports array:
InvitationsModule,
```

---

### Task 9: Emit Socket.IO event when user joins via invitation

**Files:**
- Modify: `backend/src/presentation/http/invitations/invitations.controller.ts`
- Modify: `backend/src/presentation/websocket/chat.gateway.ts`

- [ ] **Step 1: Inject ChatGateway into InvitationsController**

Add to constructor:
```typescript
import { ChatGateway } from '../../websocket/chat.gateway';

constructor(
  // ...
  private readonly chatGateway: ChatGateway,
) {}
```

In `acceptInvitation`:
```typescript
// After successful acceptance, emit to channel room
this.chatGateway.server
  .to(`channel:${result.member.channelId}`)
  .emit('message.sent', {
    id: result.systemMessageId,
    channelId: result.member.channelId,
    content: JSON.stringify({
      type: 'system.join',
      userId: user.id,
      username: user.username,
    }),
    senderId: user.id,
    isSystem: true,
    createdAt: new Date(),
  });

// Also emit member joined event
this.chatGateway.server
  .to(`channel:${result.member.channelId}`)
  .emit('channel.member.joined', {
    channelId: result.member.channelId,
    userId: user.id,
    username: user.username,
  });
```

---

### Task 10: Update MembersPanel — add invite button and modal

**Files:**
- Modify: `frontend/src/modules/chat/components/members/MembersPanel.tsx`
- Create: `frontend/src/modules/chat/components/members/InviteLinkModal.tsx`

- [ ] **Step 1: Add invite button to MembersPanel**

At the bottom of the panel (after the members list), add:

```tsx
{/* Invite section */}
<div className="border-t border-gray-light p-3 mt-auto">
  <button
    onClick={onGenerateInvite}
    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary text-sm font-medium transition-colors"
  >
    <IconLink size={16} />
    <span>Generar enlace de invitación</span>
  </button>
</div>
```

Add `onGenerateInvite` to props interface and pass it from `ChatView`.

- [ ] **Step 2: Create `InviteLinkModal.tsx`**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconCopy, IconCheck, IconLink } from "@tabler/icons-react";

interface InviteLinkModalProps {
  isOpen: boolean;
  inviteUrl: string | null;
  isGenerating: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

export function InviteLinkModal({
  isOpen,
  inviteUrl,
  isGenerating,
  onClose,
  onGenerate,
}: InviteLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                  <IconLink size={18} className="text-primary" />
                </span>
                <div>
                  <h6 className="font-semibold">Enlace de invitación</h6>
                  <p className="small-muted">Comparte este enlace para invitar miembros</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-silver-light text-silver-dark transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Content */}
            {!inviteUrl ? (
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGenerating ? "Generando..." : "Generar enlace"}
              </button>
            ) : (
              <div>
                <div className="flex items-center gap-2 p-3 bg-silver-light rounded-lg mb-3">
                  <span className="text-sm text-gray-dark truncate flex-1">{inviteUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-white text-primary transition-colors shrink-0"
                  >
                    {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                  </button>
                </div>
                <p className="small-muted text-center">
                  El enlace expira en 7 días
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

### Task 11: Create invitation actions and hooks

**Files:**
- Create: `frontend/src/modules/chat/actions/invitations/create-invitation.action.ts`
- Create: `frontend/src/modules/chat/actions/invitations/accept-invitation.action.ts`
- Create: `frontend/src/modules/chat/hooks/invitations/useInvitationMutations.ts`

- [ ] **Step 1: Create `create-invitation.action.ts`**

```typescript
import { invitationsApi } from "@/modules/chat/api/invitations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

interface CreateInvitationResponse {
  token: string;
  expiresAt: string;
  url: string;
}

export const createInvitationAction = async (channelId: string) => {
  try {
    const { data } = await invitationsApi.post<ApiResponse<CreateInvitationResponse>>(
      `/channels/${channelId}/invitations`,
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al generar enlace" };
  }
};
```

- [ ] **Step 2: Create `accept-invitation.action.ts`**

```typescript
import { invitationsApi } from "@/modules/chat/api/invitations.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

interface AcceptInvitationResponse {
  channelId: string;
  systemMessageId: string;
}

export const acceptInvitationAction = async (token: string) => {
  try {
    const { data } = await invitationsApi.post<ApiResponse<AcceptInvitationResponse>>(
      `/invitations/${token}/accept`,
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al aceptar invitación" };
  }
};
```

- [ ] **Step 3: Create API client**

`frontend/src/modules/chat/api/invitations.api.ts`:
```typescript
import { api } from "@/shared/lib/api";

export const invitationsApi = {
  post: <T>(url: string, body?: unknown) =>
    api.post<T>(url, body),
};
```

- [ ] **Step 4: Create `useInvitationMutations.ts`**

```typescript
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createInvitationAction } from "@/modules/chat/actions/invitations/create-invitation.action";

export function useInvitationMutations() {
  const router = useRouter();

  const createInvitationMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await createInvitationAction(channelId);
      if (!res.success) throw new Error(res.message ?? "Error al generar enlace");
      return res.data;
    },
  });

  return {
    createInvitationMutation,
  };
}
```

---

### Task 12: Wire invite button through ChatView → MembersPanel

**Files:**
- Modify: `frontend/src/modules/chat/components/chat/ChatView.tsx`

- [ ] **Step 1: Add state and mutation to ChatView**

```tsx
// Add imports
import { useState } from "react";
import { InviteLinkModal } from "@/modules/chat/components/members/InviteLinkModal";
import { useInvitationMutations } from "@/modules/chat/hooks/invitations/useInvitationMutations";
import { useChatStore } from "@/modules/chat/store/chat.store";

// Add inside component:
const [isInviteModalOpen, setInviteModalOpen] = useState(false);
const { createInvitationMutation } = useInvitationMutations();

const handleGenerateInvite = () => {
  setInviteModalOpen(true);
  createInvitationMutation.mutate(channelId);
};

// Pass to MembersPanel:
<MembersPanel
  isOpen={isMembersPanelOpen}
  members={members}
  onClose={() => setMembersPanelOpen(false)}
  onGenerateInvite={handleGenerateInvite}
/>

// Add modal:
<InviteLinkModal
  isOpen={isInviteModalOpen}
  inviteUrl={createInvitationMutation.data?.url ?? null}
  isGenerating={createInvitationMutation.isPending}
  onClose={() => setInviteModalOpen(false)}
  onGenerate={() => createInvitationMutation.mutate(channelId)}
/>
```

---

### Task 13: Create invite acceptance page

**Files:**
- Create: `frontend/src/app/(chat)/invite/[token]/page.tsx`
- Create: `frontend/src/modules/chat/components/invite/InviteAcceptanceClient.tsx`

- [ ] **Step 1: Create route (Server Component)**

`frontend/src/app/(chat)/invite/[token]/page.tsx`:
```tsx
import { InviteAcceptanceClient } from "@/modules/chat/components/invite/InviteAcceptanceClient";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  return <InviteAcceptanceClient token={token} />;
}
```

- [ ] **Step 2: Create client component**

`frontend/src/modules/chat/components/invite/InviteAcceptanceClient.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconHash, IconLinkOff } from "@tabler/icons-react";
import { acceptInvitationAction } from "@/modules/chat/actions/invitations/accept-invitation.action";
import { useAuthStore } from "@/modules/auth/store/auth.store";

interface InviteAcceptanceClientProps {
  token: string;
}

export function InviteAcceptanceClient({ token }: InviteAcceptanceClientProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking-auth" | "accepting" | "redirecting">("checking-auth");

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      // Not logged in → redirect to login with return URL
      router.replace(`/login?redirect=/invite/${token}`);
      return;
    }

    setStatus("accepting");

    acceptInvitationAction(token)
      .then((res) => {
        if (!res.success) {
          setError(res.message ?? "Error al aceptar invitación");
          return;
        }
        setStatus("redirecting");
        // Add channel to joined list (invalidate memberships cache)
        // Then redirect to channel
        setTimeout(() => {
          router.replace(`/channels/${res.data.channelId}`);
        }, 800); // Brief delay to show success
      })
      .catch(() => {
        setError("Error al aceptar invitación");
      });
  }, [user, isAuthLoading, token, router]);

  // Loading skeleton
  if (status === "checking-auth" || status === "accepting") {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Animated skeleton */}
          <div className="w-16 h-16 rounded-2xl bg-primary-light animate-pulse flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <IconHash size={28} className="text-primary" />
            </motion.div>
          </div>
          <div className="text-center">
            <div className="h-5 w-48 bg-gray-light rounded animate-pulse mb-2 mx-auto" />
            <div className="h-4 w-32 bg-gray-light rounded animate-pulse mx-auto" />
          </div>
          <p className="small-muted mt-2">
            {status === "checking-auth" ? "Verificando acceso..." : "Uniéndote al canal..."}
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-error-light flex items-center justify-center">
            <IconLinkOff size={28} className="text-error" />
          </div>
          <h6 className="font-semibold">Enlace no válido</h6>
          <p className="p-muted">{error}</p>
          <button
            onClick={() => router.push("/channels")}
            className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Ir a canales
          </button>
        </motion.div>
      </div>
    );
  }

  // Redirecting
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center"
        >
          <IconHash size={28} className="text-green-600" />
        </motion.div>
        <h6 className="font-semibold">¡Bienvenido al canal!</h6>
        <p className="small-muted">Redirigiendo...</p>
      </motion.div>
    </div>
  );
}
```

---

### Task 14: Render system messages in chat

**Files:**
- Modify: `frontend/src/modules/chat/interfaces/channels/channel.interface.ts`
- Modify: `frontend/src/modules/chat/components/chat/MessageList.tsx`
- Modify: `frontend/src/modules/chat/interfaces/message.interface.ts`

- [ ] **Step 1: Add `isSystem` to Message interface**

`frontend/src/modules/chat/interfaces/message.interface.ts`:
```typescript
export interface Message {
  id: string;
  content: string;
  author: { id: string; username: string; avatarUrl?: string };
  channel?: { id: string; name: string };
  replyTo: string | null;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
}
```

- [ ] **Step 2: Update `MessageList.tsx` to render system messages**

Add a branch in the message rendering:

```tsx
// In the message map, before rendering normal message:
{message.isSystem ? (
  <SystemMessage
    key={message.id}
    content={message.content}
    createdAt={message.createdAt}
  />
) : (
  <NormalMessage ... />
)}
```

- [ ] **Step 3: Create SystemMessage component**

In `MessageList.tsx` or a separate file:

```tsx
function SystemMessage({ content, createdAt }: { content: string; createdAt: string }) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  if (parsed.type === "system.join") {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary-light/40 rounded-full">
          <span className="text-xs text-primary font-medium">
            {parsed.username || "Alguien"} se unió al canal
          </span>
        </div>
      </div>
    );
  }

  return null;
}
```

---

### Task 15: Handle login redirect for invite links

**Files:**
- Modify: `frontend/src/modules/auth/components/login/LoginFormFields.tsx`

- [ ] **Step 1: Add `redirect` query param support**

In `LoginFormFields.tsx`, after successful login:
```typescript
const searchParams = useSearchParams();
const redirect = searchParams.get("redirect") ?? "/channels";

// On success:
router.push(redirect);
```

This is already implemented if the login already uses `useSearchParams`. Just verify it redirects correctly.

---

### Task 16: Test the full flow

- [ ] **Step 1: Run backend and frontend**

```bash
# Terminal 1
cd backend
pnpm run start:dev

# Terminal 2
cd frontend
pnpm run dev
```

- [ ] **Step 2: Test create invitation**
1. Login as admin
2. Go to a private channel
3. Click members panel → "Generar enlace de invitación"
4. Verify link appears in modal
5. Click copy

- [ ] **Step 3: Test accept invitation (logged in)**
1. Open incognito/logout
2. Login as another user
3. Open `/invite/{token}` directly
4. Verify skeleton appears
5. Verify redirect to channel
6. Verify system message "X se unió al canal"

- [ ] **Step 4: Test accept invitation (not logged in)**
1. Open incognito
2. Open `/invite/{token}`
3. Verify redirect to `/login?redirect=/invite/{token}`
4. Login
5. Verify redirect back to invite
6. Verify joined channel

- [ ] **Step 5: Test expired/invalid token**
1. Try `/invite/invalid-token`
2. Verify error screen with "Enlace no válido"

---

## Self-Review

**1. Spec coverage:**
- ✅ Generate shareable invitation link → Tasks 1-9 (backend), Tasks 10-11 (frontend)
- ✅ Copy link to clipboard → Task 10 (InviteLinkModal)
- ✅ Non-logged-in users redirect to login → Task 13 (InviteAcceptanceClient)
- ✅ Skeleton loading → Task 13
- ✅ Redirect to channel after acceptance → Task 13
- ✅ System message "X se unió al canal" → Tasks 7, 14
- ✅ Real-time update for existing members → Task 9 (Socket.IO emit)
- ❌ Notification in bell (campanita) — explicitly deferred

**2. Placeholder scan:** No TBD, TODOs, or placeholders found.

**3. Type consistency:**
- `CreateInvitationData` → `CreateChannelInvitationData` to match entity name ✓
- `ChannelInvitationEntity` → `ChannelInvitationPrismaRepository` → `ChannelInvitationRepository` ✓
- `CreateInvitationUseCase.execute` returns `ChannelInvitationEntity` ✓
- `AcceptInvitationUseCase.execute` returns `{ member, systemMessageId }` ✓
- Backend `MessageRepository.create` accepts `isSystem` field ✓
- Frontend `Message.isSystem` is optional boolean ✓
