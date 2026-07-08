# Plan: Real-time Members, Conversations & Membership Bug Fixes

> **For agentic workers:** Steps use checkbox (`- [ ]`) for tracking.
>
> **Branch:** `infrastructure/workers` (continuación del trabajo anterior)

---

## Bugs Detectados (Prioridad Alta)

### Bug 1: Memberships perdidas al refrescar la página
**Síntoma:** Un usuario que creó un canal privado o aceptó una invitación, al refrescar la página o volver a login, ve el canal como "Solo invitación" en lugar de "Entrar".

**Causa raíz:** `joinedChannelIds` se guarda en un array de Zustand **en memoria**. No hay un endpoint backend que devuelva los canales donde el usuario es miembro. En cada refresh el array arranca vacío.

### Bug 2: Members panel vacío
**Síntoma:** El panel de miembros del canal (sidebar derecha) siempre muestra vacío.

**Causa raíz:** La query `getMembers` en `useChannelQueries.ts` retorna `[]` con un TODO. No hay endpoint `GET /api/channels/:id/members`.

### Bug 3: Member count en 0
**Síntoma:** `ChannelCard` siempre muestra "0 miembros".

**Causa raíz:** El endpoint de lista de canales no incluye `membersCount`.

### Bug 4: Lista de conversaciones no se actualiza en tiempo real
**Síntoma:** Estás en `/messages`, alguien te envía un DM, y no ves el mensaje nuevo hasta que refrescas.

**Causa raíz:** El backend emite `conversation.message.sent` solo a la sala `conversation:{id}`, pero el usuario en `/messages` no está en esa sala. No hay un evento global que notifique al otro usuario.

---

## Solución por Bug

| Bug | Solución | Backend | Frontend |
|-----|----------|---------|----------|
| **Bug 1** — Memberships perdidas | Endpoint `GET /api/channels/memberships` que retorna los channel IDs del usuario. Inicializar Zustand desde API | `GetUserMembershipsUseCase` + ruta en controller | `useChannelQueries`: fetch real. `chat.store`: inicializar desde API |
| **Bug 2** — Members panel vacío | Endpoint `GET /api/channels/:id/members` + query real | `GetChannelMembersUseCase` + ruta | `getChannelMembersAction` + hook Socket.IO |
| **Bug 3** — Member count en 0 | Incluir `_count.members` en la respuesta de canales | Modificar `ChannelMapper.toResponse` | Receptivo automático |
| **Bug 4** — Lista conversaciones no actualizada | Emitir evento `conversation.updated` a `user:{userId}` + hook frontend que escuche | Modificar `conversations.controller.ts` (sendMessage) | `useRealtimeConversationList` hook |

---

## Tasks Detalladas

---

### TASK 1: Backend — Endpoint `GET /api/channels/memberships`

**Archivos:**
- **Crear:** `backend/src/application/use-cases/channels/get-user-memberships.usecase.ts`
- **Modificar:** `backend/src/presentation/http/channels/channels.controller.ts`
- **Modificar:** `backend/src/presentation/http/channels/channels.module.ts`

- [ ] **Step 1: Crear use case**

```typescript
// backend/src/application/use-cases/channels/get-user-memberships.usecase.ts
import { Injectable } from '@nestjs/common';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';

@Injectable()
export class GetUserMembershipsUseCase {
  constructor(
    private readonly channelMemberRepo: ChannelMemberRepository,
  ) {}

  async execute(userId: string): Promise<string[]> {
    const members = await this.channelMemberRepo.findByUser(userId);
    return members.map((m) => m.channelId);
  }
}
```

- [ ] **Step 2: Agregar ruta en controller**

```typescript
// En channels.controller.ts
@Get('memberships')
@UseGuards(JwtAuthGuard)
async getUserMemberships(@Req() req: AuthenticatedRequest) {
  const channelIds = await this.getUserMembershipsUseCase.execute(req.user.id);
  return ResponseInterceptor.success(channelIds, 'Memberships obtenidas');
}
```

- [ ] **Step 3: Registrar en módulo**

```typescript
// En channels.module.ts, providers array:
GetUserMembershipsUseCase,
```

---

### TASK 2: Frontend — Memberships real desde API

**Archivos:**
- **Modificar:** `frontend/src/modules/chat/hooks/channels/useChannelQueries.ts`
- **Modificar:** `frontend/src/modules/chat/store/chat.store.ts`

- [ ] **Step 1: Actualizar `getMemberships` query para que haga fetch real**

```typescript
// En useChannelQueries.ts — reemplazar query actual:

const MEMBERSHIPS_KEY = ["memberships"] as const;

const getMemberships = useQuery({
  queryKey: MEMBERSHIPS_KEY,
  queryFn: async (): Promise<string[]> => {
    const res = await getMembershipsAction();
    if (!res.success) return [];
    return res.data; // array de channel IDs
  },
  staleTime: 30_000, // 30s antes de refetch
});
```

- [ ] **Step 2: Crear action `getMembershipsAction`**

Crear `frontend/src/modules/chat/actions/channels/get-memberships.action.ts`:

```typescript
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export const getMembershipsAction = async (): Promise<ApiResponse<string[]>> => {
  try {
    const { data } = await channelsApi.get<ApiResponse<string[]>>("/memberships");
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, data: [] };
  }
};
```

- [ ] **Step 3: Inicializar Zustand desde API**

En `chat.store.ts`, agregar método `initializeMemberships`:

```typescript
initializeMemberships: (channelIds: string[]) => {
  set({ joinedChannelIds: channelIds });
},
```

Y llamarlo cuando se resuelva la query `getMemberships`. Hacerlo en el componente que renderiza ChannelsPage o en un hook `useMembershipsSync`:

```typescript
// Hook: useMembershipsSync.ts
export function useMembershipsSync() {
  const { data: memberships } = useChannelQueries().getMemberships;
  const initializeMemberships = useChatStore((s) => s.initializeMemberships);

  useEffect(() => {
    if (memberships) {
      initializeMemberships(memberships);
    }
  }, [memberships, initializeMemberships]);
}
```

- [ ] **Step 4: Usar `useMembershipsSync` en el layout de chat**

Agregar el hook en `frontend/src/app/(chat)/layout.tsx` (o el layout principal del chat) para que se sincronice al cargar cualquier página de chat.

---

### TASK 3: Backend — Endpoint `GET /api/channels/:id/members`

**Archivos:**
- **Crear:** `backend/src/application/use-cases/channels/get-channel-members.usecase.ts`
- **Modificar:** `backend/src/presentation/http/channels/channels.controller.ts`
- **Modificar:** `backend/src/presentation/http/channels/channels.module.ts`

- [ ] **Step 1: Crear use case**

```typescript
// backend/src/application/use-cases/channels/get-channel-members.usecase.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';

export interface ChannelMemberResponse {
  id: string;
  userId: string;
  username: string;
  role: string;
  isOnline: boolean;
  joinedAt: Date;
}

@Injectable()
export class GetChannelMembersUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(channelId: string): Promise<ChannelMemberResponse[]> {
    const channel = await this.channelRepo.findById(channelId);
    if (!channel) throw new NotFoundException('Canal no encontrado');

    const members = await this.channelMemberRepo.findByChannel(channelId);
    const userIds = members.map((m) => m.userId);
    const users = await Promise.all(
      userIds.map((uid) => this.userRepo.findById(uid)),
    );
    const userMap = new Map(
      users.filter(Boolean).map((u) => [u!.id, u!]),
    );

    return members.map((member) => ({
      id: member.id,
      userId: member.userId,
      username: userMap.get(member.userId)?.username ?? 'Usuario',
      role: member.role,
      isOnline: userMap.get(member.userId)?.isOnline ?? false,
      joinedAt: member.joinedAt,
    }));
  }
}
```

- [ ] **Step 2: Agregar ruta en controller**

```typescript
@Get(':id/members')
async getChannelMembers(
  @Param('id', ParseUUIDPipe) id: string,
  @Req() req: AuthenticatedRequest,
) {
  // Verificar que el usuario es miembro del canal
  const member = await this.channelMemberRepo.findByUserAndChannel(req.user.id, id);
  if (!member) throw new ForbiddenException('No eres miembro de este canal');

  const members = await this.getChannelMembersUseCase.execute(id);
  return ResponseInterceptor.success(members, 'Miembros obtenidos');
}
```

- [ ] **Step 3: Registrar en módulo**

```typescript
GetChannelMembersUseCase,
```

---

### TASK 4: Frontend — Members query real + real-time

**Archivos:**
- **Crear:** `frontend/src/modules/chat/actions/channels/get-channel-members.action.ts`
- **Modificar:** `frontend/src/modules/chat/hooks/channels/useChannelQueries.ts`
- **Crear:** `frontend/src/modules/chat/hooks/channels/useRealtimeChannelMembers.ts`
- **Modificar:** `frontend/src/modules/chat/components/chat/ChatView.tsx`

- [ ] **Step 1: Crear action**

```typescript
// get-channel-members.action.ts
import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export interface MemberApiData {
  id: string;
  userId: string;
  username: string;
  role: string;
  isOnline: boolean;
  joinedAt: string;
}

export const getChannelMembersAction = async (channelId: string) => {
  try {
    const { data } = await channelsApi.get<ApiResponse<MemberApiData[]>>(
      `/${channelId}/members`
    );
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, data: [] };
  }
};
```

- [ ] **Step 2: Actualizar `getMembers` query**

```typescript
const MEMBERS_KEY = (id: string) => ["members", id];

const getMembers = useQuery({
  queryKey: MEMBERS_KEY(channelId!),
  queryFn: async (): Promise<any[]> => {
    if (!channelId) return [];
    const res = await getChannelMembersAction(channelId);
    if (!res.success || !res.data) return [];
    return res.data.map((m) => ({
      id: m.id,
      user: {
        id: m.userId,
        username: m.username,
        email: "",
        avatarUrl: null,
        isOnline: m.isOnline,
      },
      role: m.role === "ADMIN" ? "OWNER" : "MEMBER",
      joinedAt: m.joinedAt,
    }));
  },
  enabled: !!channelId,
});
```

- [ ] **Step 3: Crear hook realtime members**

```typescript
// useRealtimeChannelMembers.ts
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/modules/chat/providers/SocketProvider";

export function useRealtimeChannelMembers(channelId: string | null) {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected || !channelId) return;

    const handleMemberJoined = (data: { channelId: string }) => {
      if (data.channelId === channelId) {
        queryClient.invalidateQueries({ queryKey: ["members", channelId] });
        queryClient.invalidateQueries({ queryKey: ["channels"] });
      }
    };

    socket.on("channel.member.joined", handleMemberJoined);

    return () => {
      socket.off("channel.member.joined", handleMemberJoined);
    };
  }, [socket, isConnected, channelId, queryClient]);
}
```

- [ ] **Step 4: Usar en ChatView**

```typescript
// En ChatView.tsx
useRealtimeChannelMembers(channelId);
```

---

### TASK 5: Backend — Member count en canales

**Archivos:**
- **Modificar:** `backend/src/presentation/http/channels/channels.controller.ts` (o el mapper de canales)

- [ ] **Step 1: Incluir `_count.members` en la query de canales**

En `ChannelPrismaRepository.findAll`:

```typescript
async findAll(): Promise<ChannelEntity[]> {
  const channels = await this.prisma.channel.findMany({
    include: {
      _count: { select: { members: true } },
    },
  });
  return channels.map(ChannelMapper.toDomain);
}
```

Y en `ChannelMapper.toDomain`, mapear `membersCount` desde `_count.members`.

- [ ] **Step 2: Agregar `membersCount` a `ChannelEntity` y response DTO**

```typescript
// En ChannelEntity
export class ChannelEntity {
  // ... existing fields
  membersCount: number;
}
```

---

### TASK 6: Backend — Emitir `conversation.updated` a user rooms

**Archivos:**
- **Modificar:** `backend/src/presentation/http/conversations/conversations.controller.ts`

- [ ] **Step 1: En el handler `sendMessage`, emitir a `user:{participantId}`**

```typescript
// Dentro de sendMessage, después de emitir a conversation room:

// Emitir a los participantes para refrescar la lista de conversaciones
const conversation = await this.getConversationUseCase.execute(conversationId, req.user.id);
const participants = await this.conversationMemberRepo.findByConversation(conversationId);

for (const participant of participants) {
  this.chatGateway.server
    .to(`user:${participant.userId}`)
    .emit('conversation.updated', { conversationId });
}
```

Requiere inyectar `ConversationMemberRepository` en el controller.

---

### TASK 7: Frontend — Real-time conversation list

**Archivos:**
- **Crear:** `frontend/src/modules/chat/hooks/conversations/useRealtimeConversationList.ts`
- **Modificar:** `frontend/src/modules/chat/components/messages/MessagePageClient.tsx`

- [ ] **Step 1: Crear hook**

```typescript
// useRealtimeConversationList.ts
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/modules/chat/providers/SocketProvider";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export function useRealtimeConversationList() {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!socket || !isConnected || !user?.id) return;

    const handleConversationUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread"] });
    };

    socket.on("conversation.updated", handleConversationUpdated);

    return () => {
      socket.off("conversation.updated", handleConversationUpdated);
    };
  }, [socket, isConnected, user?.id, queryClient]);
}
```

- [ ] **Step 2: Usar en MessagePageClient**

```typescript
// En MessagePageClient.tsx (componente que renderiza la página /messages)
import { useRealtimeConversationList } from "@/modules/chat/hooks/conversations/useRealtimeConversationList";

export function MessagePageClient() {
  useRealtimeConversationList();
  // ... resto del componente
}
```

---

### TASK 8: Backend — Sincronizar memberships al aceptar invitación

**Archivos:**
- **Revisar:** `backend/src/presentation/http/invitations/invitations.controller.ts`

- [ ] **Step 1: Verificar que al aceptar invitación, el uso del `AcceptInvitationUseCase` emite el evento Socket.IO correcto**

El `AcceptInvitationUseCase` ya debería emitir `channel.member.joined` al room `channel:{channelId}`. Verificar que también se emita a `user:{userId}` del nuevo miembro para que sincronice sus memberships.

- [ ] **Step 2: Si no existe, agregar en controller**

```typescript
// En invitations.controller.ts, después de aceptar invitación:
this.chatGateway.server
  .to(`user:${user.id}`)
  .emit('membership.added', { channelId: channel.id });
```

---

### TASK 9: Frontend — Sincronizar memberships al aceptar invitación

**Archivos:**
- **Modificar:** `frontend/src/modules/chat/components/invite/InviteAcceptanceClient.tsx`

- [ ] **Step 1: Después de aceptar, invalidar memberships y agregar al store**

```typescript
// En onSuccess del mutation:
const queryClient = useQueryClient();
const addJoinedChannel = useChatStore((s) => s.addJoinedChannel);

// ... después de aceptar:
addJoinedChannel(channel.id);
queryClient.invalidateQueries({ queryKey: ["memberships"] });
```

---

### TASK 10: Test end-to-end

- [ ] **Step 1: Test memberships en refresh**
  1. Crear canal privado con Arturo
  2. Refrescar página
  3. Verificar que el canal aparece como "Entrar" (no "Solo invitación")

- [ ] **Step 2: Test members panel**
  1. Abrir canal como Arturo
  2. Verificar que el panel lateral derecho muestra a Arturo como miembro

- [ ] **Step 3: Test acceptance flow**
  1. Generar invitación
  2. Aceptar con otro usuario (Carlos)
  3. Refrescar página de Carlos
  4. Verificar que el canal aparece en su lista como "Entrar"

- [ ] **Step 4: Test real-time conversation list**
  1. Arturo abre `/messages`
  2. Carlos envía DM a Arturo
  3. Sin refrescar, Arturo ve la conversación aparecer en la lista

- [ ] **Step 5: Test real-time members**
  1. Arturo está en el canal con el panel de miembros abierto
  2. Carlos acepta la invitación
  3. El panel se actualiza automáticamente mostrando a Carlos

---

## Resumen de archivos

### Backend (7 archivos)

| Archivo | Acción |
|---------|--------|
| `application/use-cases/channels/get-user-memberships.usecase.ts` | Crear |
| `application/use-cases/channels/get-channel-members.usecase.ts` | Crear |
| `presentation/http/channels/channels.controller.ts` | Modificar (2 rutas nuevas) |
| `presentation/http/channels/channels.module.ts` | Modificar (registrar use cases) |
| `presentation/http/conversations/conversations.controller.ts` | Modificar (emitir a user rooms) |
| `domain/entities/channel.entity.ts` | Modificar (agregar `membersCount`) |
| `infrastructure/prisma/repositories/channel.prisma-repository.ts` | Modificar (incluir `_count`) |

### Frontend (9 archivos)

| Archivo | Acción |
|---------|--------|
| `actions/channels/get-memberships.action.ts` | Crear |
| `actions/channels/get-channel-members.action.ts` | Crear |
| `hooks/channels/useChannelQueries.ts` | Modificar (queries reales) |
| `hooks/channels/useRealtimeChannelMembers.ts` | Crear |
| `hooks/channels/useMembershipsSync.ts` | Crear |
| `hooks/conversations/useRealtimeConversationList.ts` | Crear |
| `components/chat/ChatView.tsx` | Modificar (usar realtime members) |
| `components/messages/MessagePageClient.tsx` | Modificar (usar realtime conv list) |
| `components/invite/InviteAcceptanceClient.tsx` | Modificar (sync memberships) |
| `app/(chat)/layout.tsx` | Modificar (usar MembershipsSync) |
