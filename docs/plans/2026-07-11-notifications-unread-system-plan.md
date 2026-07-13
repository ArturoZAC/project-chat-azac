# Sistema de Notificaciones y No-Leídos — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sistema completo de no-leídos (DMs + canales) con notificaciones en tiempo real via campanita en TopBar

**Architecture:** Backend arregla `getUnreadCount` y agrega endpoint mark-as-read para canales + emisión `notification.new` por socket. Frontend conecta `markReadMutation`, crea NotificationStore+Bell+Dropdown con filtros, y limpia sidebar.

**Tech Stack:** NestJS, Prisma, Socket.IO, Next.js 16, Zustand, TanStack Query

---

## Task 1: Backend — Arreglar `getUnreadCount` de DMs

**Files:**
- Modify: `backend/src/infrastructure/prisma/repositories/conversation.prisma.repository.ts`

**Interfaces:**
- Consumes: nada
- Produces: `getUnreadCount()` filtrado, `create()` con `lastReadAt` inicializado

- [ ] **Step 1.1: Filtrar mensajes propios en `getUnreadCount`**

Modificar `conversation.prisma.repository.ts` línea 186-199:

```typescript
async getUnreadCount(
  conversationId: string,
  userId: string,
): Promise<number> {
  const membership = await this.prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  // Base filter: count messages in this conversation, excluding own messages
  const baseWhere: any = {
    conversationId,
    senderId: { not: userId },
  };

  if (membership?.lastReadAt) {
    baseWhere.createdAt = { gt: membership.lastReadAt };
  }

  return this.prisma.message.count({
    where: baseWhere,
  });
}
```

- [ ] **Step 1.2: Setear `lastReadAt` al crear la conversación**

En el método `create()`, modificar el `create` para incluir `lastReadAt: new Date()`:

```typescript
async create(data: CreateConversationData): Promise<ConversationEntity> {
  const conversation = await this.prisma.conversation.create({
    data: {
      members: {
        create: data.participantIds.map((userId) => ({
          userId,
          lastReadAt: new Date(),  // Initialize so no messages count as unread initially
        })),
      },
    },
  });
  return ConversationMapper.toDomain(conversation);
}
```

- [ ] **Step 1.3: Build backend**

```bash
cd backend && pnpm run build
```

---

## Task 2: Backend — Channel unread count + mark-as-read endpoint

**Files:**
- Modify: `backend/src/domain/repositories/channel-member.repository.ts`
- Modify: `backend/src/infrastructure/prisma/repositories/channel-member.prisma.repository.ts`
- Create: `backend/src/application/use-cases/channels/mark-channel-read.usecase.ts`
- Modify: `backend/src/presentation/http/channels/channels.controller.ts`

**Interfaces:**
- Consumes: `ChannelMemberRepository` (existing)
- Produces: `getUnreadCount(channelId, userId)`, `POST /channels/:id/read`

- [ ] **Step 2.1: Agregar `getUnreadCount` abstracto al repositorio**

En `channel-member.repository.ts`, agregar:

```typescript
abstract getUnreadCount(channelId: string, userId: string): Promise<number>;
```

- [ ] **Step 2.2: Implementar `getUnreadCount` en Prisma repository**

En `channel-member.prisma.repository.ts`:

```typescript
async getUnreadCount(channelId: string, userId: string): Promise<number> {
  const membership = await this.prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId } },
  });

  const baseWhere: any = {
    channelId,
    senderId: { not: userId },
  };

  if (membership?.lastReadAt) {
    baseWhere.createdAt = { gt: membership.lastReadAt };
  }

  return this.prisma.message.count({
    where: baseWhere,
  });
}
```

- [ ] **Step 2.3: Crear `MarkChannelReadUseCase`**

Crear `backend/src/application/use-cases/channels/mark-channel-read.usecase.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelMemberRepository } from '../../../domain/repositories/channel-member.repository';
import { ChannelRepository } from '../../../domain/repositories/channel.repository';

export interface MarkChannelReadParams {
  channelId: string;
  userId: string;
}

@Injectable()
export class MarkChannelReadUseCase {
  constructor(
    private readonly channelRepo: ChannelRepository,
    private readonly channelMemberRepo: ChannelMemberRepository,
  ) {}

  async execute(params: MarkChannelReadParams): Promise<void> {
    const channel = await this.channelRepo.findById(params.channelId);
    if (!channel) {
      throw new NotFoundException('Canal no encontrado');
    }

    const member = await this.channelMemberRepo.findByChannelAndUser(
      params.channelId,
      params.userId,
    );
    if (!member) {
      throw new NotFoundException('No eres miembro de este canal');
    }

    await this.channelMemberRepo.updateLastRead(params.channelId, params.userId);
  }
}
```

- [ ] **Step 2.4: Agregar endpoint en controller**

En `channels.controller.ts`:

```typescript
// En los imports agregar:
import { MarkChannelReadUseCase } from '../../../application/use-cases/channels/mark-channel-read.usecase';

// En el constructor agregar:
private readonly markChannelReadUseCase: MarkChannelReadUseCase,

// Nuevo endpoint:
@Post(':id/read')
async markChannelRead(
  @Param('id', ParseUUIDPipe) id: string,
  @Req() req: Request,
) {
  const user = req.user as UserEntity;
  await this.markChannelReadUseCase.execute({
    channelId: id,
    userId: user.id,
  });
  return ResponseInterceptor.success(null, 'Canal marcado como leído');
}
```

- [ ] **Step 2.5: Registrar en el módulo**

Asegurar que `MarkChannelReadUseCase` esté en `providers` del módulo de canales.

- [ ] **Step 2.6: Build**

```bash
cd backend && pnpm run build
```

---

## Task 3: Backend — Último mensaje en respuesta de canales

**Files:**
- Modify: `backend/src/infrastructure/prisma/mappers/channel.mapper.ts`
- Modify: `backend/src/application/use-cases/channels/get-channels.usecase.ts`
- Modify: `backend/src/presentation/http/channels/channels.controller.ts`

**Interfaces:**
- Consumes: `GetChannelsUseCase` (existing)
- Produces: `ChannelBackend.lastMessage` en respuesta

- [ ] **Step 3.1: Agregar `lastMessage` al `toResponse` del mapper**

En `channel.mapper.ts`, modificar `toResponse` para incluir `lastMessage` (o crear un método separado para la lista de canales del usuario).

Agregar un nuevo método `toUserChannelResponse` o modificar `toResponse` para que acepte un `lastMessage` opcional:

```typescript
static toResponse(
  entity: ChannelEntity,
  lastMessage?: { content: string; senderId: string; senderUsername: string; createdAt: Date } | null,
) {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    isPrivate: entity.isPrivate,
    createdById: entity.createdById,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    membersCount: entity.membersCount,
    lastMessage: lastMessage ?? null,
  };
}
```

- [ ] **Step 3.2: Modificar `GetChannelsUseCase`**

En `get-channels.usecase.ts`, al obtener canales, incluir el último mensaje de cada uno usando `messageRepo.findLastByChannel(channelId)`.

Agregar `MessageRepository` y su método `findLastByChannel`:

```typescript
// En message.repository.ts
abstract findLastByChannel(channelId: string): Promise<MessageEntity | null>;

// En message.prisma.repository.ts
async findLastByChannel(channelId: string): Promise<MessageEntity | null> {
  const message = await this.prisma.message.findFirst({
    where: { channelId },
    orderBy: { createdAt: 'desc' },
    include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
  });
  if (!message) return null;
  return MessageMapper.toDomain(message);
}
```

Luego en `get-channels.usecase.ts`, modificar execute para devolver canales con lastMessage:

```typescript
const channels = await this.channelRepo.findAll();
const channelsWithLastMessage = await Promise.all(
  channels.map(async (channel) => {
    const lastMessage = await this.messageRepo.findLastByChannel(channel.id);
    return { channel, lastMessage };
  })
);
return {
  data: channelsWithLastMessage,
  total: channels.length,
};
```

- [ ] **Step 3.3: Actualizar `ChannelMapper.toResponse` usage en controller**

En `channels.controller.ts`, actualizar `getChannels`:

```typescript
@Public()
@Get()
async getChannels(@Query() query: GetChannelsDto) {
  const result = await this.getChannelsUseCase.execute(query);
  return ResponseInterceptor.success(
    { 
      ...result, 
      data: result.data.map((item: any) => 
        ChannelMapper.toResponse(item.channel, item.lastMessage)
      ) 
    },
    'Canales obtenidos exitosamente',
  );
}
```

- [ ] **Step 3.4: Build**

```bash
cd backend && pnpm run build
```

---

## Task 4: Frontend — Actualizar `ChannelBackend` interface

**Files:**
- Modify: `frontend/src/modules/chat/interfaces/channels/channel-backend.interface.ts`
- Modify: `frontend/src/modules/chat/interfaces/channels/channel.interface.ts`

- [ ] **Step 4.1: Agregar `lastMessage` a `ChannelBackend`**

```typescript
export interface ChannelBackend {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  membersCount: number;
  lastMessage: {
    content: string;
    senderId: string;
    senderUsername: string;
    createdAt: string;
  } | null;
}
```

---

## Task 5: Frontend — Marcar DM como leído al abrir

**Files:**
- Modify: `frontend/src/modules/chat/components/dm/DMView.tsx`

- [ ] **Step 5.1: Llamar `markReadMutation` al montar**

En `DMView.tsx`, después de `useRealtimeConversationMessages(conversationId)`, agregar:

```typescript
const { sendMessageMutation, createOrGetConversationMutation, markReadMutation } = useConversationMutations();

// Mark conversation as read when opening
useEffect(() => {
  if (conversationId) {
    markReadMutation.mutate(conversationId);
  }
}, [conversationId]);
```

---

## Task 6: Frontend — Marcar canal como leído al abrir

**Files:**
- Modify: `frontend/src/modules/chat/components/chat/ChatView.tsx`
- Create: `frontend/src/modules/chat/actions/channels/mark-channel-read.action.ts`
- Modify: `frontend/src/modules/chat/hooks/channels/useChannelMutations.ts`

- [ ] **Step 6.1: Crear action `markChannelReadAction`**

```typescript
// frontend/src/modules/chat/actions/channels/mark-channel-read.action.ts
"use server";

import { api } from "@/shared/lib/api";

export const markChannelReadAction = async (channelId: string) => {
  try {
    const { data } = await api.post(`/channels/${channelId}/read`);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { success: false, message: "Error al marcar como leído" };
  }
};
```

- [ ] **Step 6.2: Agregar `markReadMutation` a `useChannelMutations`**

```typescript
import { markChannelReadAction } from "@/modules/chat/actions/channels/mark-channel-read.action";

// En el return del hook:
const markReadMutation = useMutation({
  mutationFn: async (channelId: string) => {
    const res = await markChannelReadAction(channelId);
    if (!res.success) throw new Error(res.message ?? "Error al marcar como leído");
  },
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["channels"] });
  },
});

// En el return del hook:
return {
  // ... existing,
  markReadMutation,
};
```

- [ ] **Step 6.3: Llamar `markReadMutation` en `ChatView.tsx`**

```typescript
const { markReadMutation } = useChannelMutations();

useEffect(() => {
  if (channelId) {
    markReadMutation.mutate(channelId);
  }
}, [channelId]);
```

---

## Task 7: Frontend — Mostrar último mensaje de canales en /messages

**Files:**
- Modify: `frontend/src/modules/chat/components/messages/ConversationList.tsx`
- Modify: `frontend/src/modules/chat/hooks/channels/useChannelQueries.ts`

- [ ] **Step 7.1: Actualizar `mapChannel` para incluir lastMessage**

En `useChannelQueries.ts`, modificar `mapChannel`:

```typescript
function mapChannel(ch: ChannelBackend): Channel {
  return {
    id: ch.id,
    name: ch.name,
    description: ch.description ?? undefined,
    type: ch.isPrivate ? "PRIVATE" : "PUBLIC",
    owner: { id: ch.createdById, username: "" },
    membersCount: ch.membersCount,
    createdAt: ch.createdAt,
    updatedAt: ch.updatedAt,
    lastMessage: ch.lastMessage ?? undefined,
  };
}
```

- [ ] **Step 7.2: Actualizar `Channel` interface**

En `channel.interface.ts`, agregar `lastMessage`:

```typescript
export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: "PUBLIC" | "PRIVATE";
  owner: { id: string; username: string };
  membersCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    senderId: string;
    senderUsername: string;
    createdAt: string;
  };
}
```

- [ ] **Step 7.3: En `ConversationList.tsx`, mostrar último mensaje de canales**

```typescript
// En el items.push del canal, reemplazar:
lastMessage: channel.lastMessage
  ? `${channel.lastMessage.senderUsername}: ${channel.lastMessage.content}`
  : "Sin mensajes aún",
lastTime: channel.lastMessage?.createdAt ?? channel.updatedAt,
```

---

## Task 8: Backend — Emitir `notification.new` por socket

**Files:**
- Modify: `backend/src/presentation/websocket/chat.gateway.ts`

- [ ] **Step 8.1: Emitir notificación al enviar mensaje de canal**

En `handleSendMessage`, después de emitir `message.sent`, agregar:

```typescript
// Emit notification to all channel members except sender
const channelMemberIds = (await this.channelMemberRepo.findByChannel(data.channelId))
  .map((m) => m.userId)
  .filter((id) => id !== user.id);

for (const memberId of channelMemberIds) {
  this.server.to(`user:${memberId}`).emit('notification.new', {
    id: message.id,
    type: 'channel',
    title: `#${data.channelId}`,  // will be resolved to channel name on frontend
    message: 'te escribió un mensaje',
    channelName: data.channelId,   // will be resolved to channel name on frontend
    channelId: data.channelId,
    conversationId: null,
    senderId: user.id,
    senderUsername: user.username,
    createdAt: message.createdAt,
  });
}
```

- [ ] **Step 8.2: Emitir notificación al enviar mensaje DM**

En `handleSendConversationMessage`, después de emitir `conversation.message.sent`, agregar:

```typescript
// Emit notification to the other participant
const participants = await this.conversationRepo.findParticipants(data.conversationId);
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
```

- [ ] **Step 8.3: Build**

```bash
cd backend && pnpm run build
```

---

## Task 9: Frontend — NotificationStore (Zustand)

**Files:**
- Create: `frontend/src/modules/chat/store/notification.store.ts`

- [ ] **Step 9.1: Crear el store**

```typescript
import { create } from "zustand";

export interface Notification {
  id: string;
  type: "dm" | "channel";
  title: string;
  message: string;
  channelName?: string | null;
  conversationId?: string | null;
  channelId?: string | null;
  senderId: string;
  senderUsername: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  filter: "all" | "dm" | "channel";

  addNotification: (notification: Omit<Notification, "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setFilter: (filter: "all" | "dm" | "channel") => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  filter: "all",

  addNotification: (notification) => {
    const exists = get().notifications.some((n) => n.id === notification.id);
    if (exists) return;

    set((state) => ({
      notifications: [
        { ...notification, isRead: false },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  setFilter: (filter) => set({ filter }),
}));
```

---

## Task 10: Frontend — Socket listener de notificaciones

**Files:**
- Create: `frontend/src/modules/chat/hooks/useRealtimeNotifications.ts`

- [ ] **Step 10.1: Crear hook**

```typescript
"use client";

import { useCallback, useEffect } from "react";
import { useSocketEvents } from "@/modules/chat/hooks/useSocketEvents";
import { useNotificationStore } from "@/modules/chat/store/notification.store";

interface NotificationPayload {
  id: string;
  type: "dm" | "channel";
  title: string;
  message: string;
  channelName?: string | null;
  conversationId?: string | null;
  channelId?: string | null;
  senderId: string;
  senderUsername: string;
  createdAt: string;
}

export function useRealtimeNotifications() {
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleNotification = useCallback(
    (data: NotificationPayload) => {
      addNotification(data);
    },
    [addNotification],
  );

  useSocketEvents({
    "notification.new": handleNotification,
  });
}
```

---

## Task 11: Frontend — NotificationBell + NotificationDropdown

**Files:**
- Create: `frontend/src/modules/chat/components/notifications/NotificationBell.tsx`
- Create: `frontend/src/modules/chat/components/notifications/NotificationDropdown.tsx`

- [ ] **Step 11.1: Crear `NotificationBell.tsx`**

```tsx
"use client";

import { useState } from "react";
import { IconBell } from "@tabler/icons-react";
import { useNotificationStore } from "@/modules/chat/store/notification.store";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-silver-light transition-colors"
        aria-label="Notificaciones"
      >
        <IconBell size={20} className="text-silver-dark" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
```

- [ ] **Step 11.2: Crear `NotificationDropdown.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IconMessage, IconHash, IconCheck, IconFilter } from "@tabler/icons-react";
import { useNotificationStore, Notification } from "@/modules/chat/store/notification.store";

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

interface NotificationDropdownProps {
  onClose: () => void;
}

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "dm", label: "DMs" },
  { key: "channel", label: "Canales" },
] as const;

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, filter, setFilter, markAsRead, markAllAsRead } = useNotificationStore();

  const filteredNotifications = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const unreadNotifications = filteredNotifications.filter((n) => !n.isRead);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleClickNotification = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.type === "dm" && notification.conversationId) {
      // Navigate by userId since DM routes are /dm/:userId
      router.push(`/dm/${notification.senderId}`);
    } else if (notification.type === "channel" && notification.channelId) {
      router.push(`/channels/${notification.channelId}`);
    }
    onClose();
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-light rounded-xl shadow-lg z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-light">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Notificaciones</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-medium"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-silver-light text-gray-dark hover:bg-gray-light"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto">
        {unreadNotifications.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
              <IconCheck size={20} className="text-primary" />
            </div>
            <p className="text-sm font-medium">Todo al día</p>
            <p className="small-muted">No hay notificaciones nuevas</p>
          </div>
        ) : (
          unreadNotifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClickNotification(notification)}
              className="flex items-start gap-3 w-full text-left px-4 py-3 hover:bg-silver-light transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                notification.type === "dm"
                  ? "bg-primary/10"
                  : "bg-primary-light"
              }`}>
                {notification.type === "dm" ? (
                  <IconMessage size={16} className="text-primary" />
                ) : (
                  <IconHash size={16} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold truncate">
                    {notification.type === "dm"
                      ? notification.title
                      : `#${notification.channelName ?? notification.title}`}
                  </span>
                  <span className="small-muted shrink-0">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-dark truncate mt-0.5">
                  {notification.senderUsername} {notification.message}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
}
```

---

## Task 12: Frontend — Quitar badge de "Mensajes" en Sidebar + Integrar campanita en TopBar

**Files:**
- Modify: `frontend/src/modules/chat/components/sidebar/SidebarClient.tsx`
- Modify: `frontend/src/modules/chat/components/layout/TopBarClient.tsx`
- Delete (or ignore): `frontend/src/modules/chat/components/notifications/NotificationPanel.tsx` (replaced by NotificationDropdown)

- [ ] **Step 12.1: Quitar badge de "Mensajes" en Sidebar**

En `SidebarClient.tsx`:
- Eliminar líneas 86-88 (`totalChannelUnread`, `totalConvUnread`, `totalUnread`)
- Eliminar línea 121: `const showBadge = item.id === "messages" && totalUnread > 0;`
- Eliminar líneas 151-155 (badge expanded)
- Eliminar líneas 158-159 (badge collapsed)
- Eliminar `const { getTotalUnread: getChannelUnread, getMemberships }` y `const { getTotalUnread: getConvUnread, getConversations }` — pero mantener `getMemberships` y `getConversations` para la lista de directos/canales

- [ ] **Step 12.2: Integrar `NotificationBell` en `TopBarClient.tsx`**

Reemplazar el botón de campanita existente con `NotificationBell`:

```tsx
import { NotificationBell } from "@/modules/chat/components/notifications/NotificationBell";
import { useRealtimeNotifications } from "@/modules/chat/hooks/useRealtimeNotifications";

export function TopBarClient() {
  useRealtimeNotifications();
  // ...
  // Reemplazar el botón existente:
  <NotificationBell />
  // Eliminar el NotificationPanel viejo
}
```

- [ ] **Step 12.3: Build frontend**

```bash
cd frontend && pnpm run build
```
