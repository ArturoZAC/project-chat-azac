# Sistema de Notificaciones y No-Leídos

> **Status:** Pendiente de implementación
> **Date:** 2026-07-11
> **Author:** AI Agent

## Problemas Detectados

1. **Unread count de DMs muestra total de mensajes en vez de solo no-leídos** — porque `lastReadAt` es `null` al crear la conversación y `getUnreadCount()` cuenta todos los mensajes incluyendo los propios
2. **Canales en /messages muestran "Sin mensajes aún"** aunque tengan mensajes — el `lastMessage` está hardcodeado
3. **Sidebar muestra badge numérico en "Mensajes"** que el usuario considera antiestético — solo debería tener highlight al estar seleccionado
4. **No existe sistema de notificaciones en tiempo real** — no hay campanita ni panel de notificaciones
5. **`markReadMutation` nunca se llama** desde el frontend — existe el hook y el endpoint pero nadie lo ejecuta

## Visión General

```
┌─────────────────────────────────────────────────────┐
│ TopBar                                              │
│  [breadcrumbs]              [🔔 3] [Avatar]         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─ /messages ─────────────────────────────────┐    │
│  │  💬 María: hola               3              │    │
│  │  #  #general: Arturo: hola a todos   2       │    │
│  │  💬 Juan: qué tal                1           │    │
│  └──────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- **Campanita (🔔) en TopBar**: Muestra TODAS las notificaciones (DMs + canales) con badge total
- **/messages**: Muestra contadores individuales por conversación, solo se limpian al entrar al chat
- **Sidebar "Mensajes"**: Sin badge numérico, solo highlight al estar en /messages
- **"Marcar todas como leídas"**: Limpia el badge de la campanita, NO marca conversaciones como leídas

---

## 1. Backend — Arreglos en DMs

### 1.1 Filtrar mensajes propios en `getUnreadCount`

**Archivo:** `conversation.prisma.repository.ts`

Modificar `getUnreadCount()` para excluir mensajes enviados por el propio usuario:

```
where: {
  conversationId,
  senderId: { not: userId },  // ← nuevo
  ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
}
```

### 1.2 Setear `lastReadAt` al crear la conversación

**Archivo:** `conversation.prisma.repository.ts`

Modificar `create()` para que ambos miembros tengan `lastReadAt` inicializado al crearla (así no cuentan mensajes previos como no-leídos):

```
create: data.participantIds.map((userId) => ({
  userId,
  lastReadAt: new Date(),  // ← nuevo
})),
```

---

## 2. Backend — Arreglos en Canales

### 2.1 Agregar `getUnreadCount` para canales

**Archivo:** `channel-member.repository.ts` + `channel-member.prisma.repository.ts`

Agregar método `getUnreadCount(channelId, userId)` que cuente mensajes del canal con `createdAt > lastReadAt`, excluyendo los del propio usuario.

### 2.2 Endpoint de mark-as-read para canales

**Nuevo:** `POST /api/channels/:channelId/read`

- Use case: `MarkChannelReadUseCase`
- Controller: agregar en `channels.controller.ts`
- Llama a `channelMemberRepo.updateLastRead(channelId, userId)`

### 2.3 Agregar último mensaje en respuesta de canales

**Modificar:** `GET /api/channels` (el listado de canales del usuario)

Incluir `lastMessage: { content, senderId, senderUsername, createdAt } | null` en cada channel de la respuesta, similar a como ya funciona en `GET /api/conversations`.

Esto permite que /messages muestre el último mensaje de cada canal.

---

## 3. Frontend — Conectar markAsRead

### 3.1 Llamar `markReadMutation` al abrir un DM

**Archivo:** `DMView.tsx`

- Obtener `conversationId` desde los queries o props
- En `useEffect` al montar (o cuando cambia `conversationId`), llamar `markReadMutation.mutate(conversationId)`
- Marcar como leído SOLO si hay mensajes no leídos

### 3.2 Agregar `useChannelMutations.markRead`

**Archivo:** `useChannelMutations.ts`

- Crear `markReadMutation` que haga `POST /api/channels/:channelId/read`
- En `ChannelView` (o similar), llamar `markReadMutation.mutate(channelId)` al montar

### 3.3 Actualizar queries de canal con último mensaje

**Archivo:** `ChannelBackend` interface + `useChannelQueries.ts`

- Agregar `lastMessage` al mapper de canales
- Mostrar el último mensaje en `ConversationList.tsx` en vez del hardcoded "Sin mensajes aún"

---

## 4. Frontend — Notificaciones en Tiempo Real

### 4.1 Backend: Emitir evento de notificación por socket

**Archivo:** `chat.gateway.ts`

Cuando se envía un mensaje (DM o canal), emitir evento `notification.new` al `user:{userId}` del destinatario(s):

```json
{
  "id": "uuid",
  "type": "dm" | "channel",
  "title": "María",
  "message": "te envió un mensaje",
  "channelName": null,
  "conversationId": "uuid",
  "channelId": null,
  "senderId": "uuid",
  "senderUsername": "María",
  "createdAt": "2026-07-11T..."
}
```

Para DMs: emitir al `user:{otherParticipantId}`
Para canales: emitir a `user:{memberId}` de todos los miembros EXCEPTO el sender, con el nombre del canal.

### 4.2 Frontend: NotificationStore (Zustand)

**Archivo:** `store/notification.store.ts`

```
interface Notification {
  id: string;
  type: "dm" | "channel";
  title: string;           // nombre del usuario o canal
  message: string;         // "te envió un mensaje"
  channelName?: string;    // solo para canales
  conversationId?: string;
  channelId?: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  filter: "all" | "dm" | "channel";

  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setFilter: (filter: "all" | "dm" | "channel") => void;
}
```

**Comportamiento de `markAllAsRead`:**
- Marca todas las notificaciones como leídas (`isRead = true`)
- El badge de la campanita desaparece
- NO marca las conversaciones/canales como leídos en el backend
- El contador en /messages sigue igual hasta que entres al chat

### 4.3 Frontend: Socket listener

**Archivo:** `useRealtimeNotifications.ts`

- Escucha `notification.new` del socket
- Al recibirlo, lo agrega al `NotificationStore`
- También invalida `["conversations"]` y `["messages", channelId]` según corresponda

### 4.4 Frontend: NotificationBell (componente)

**Archivo:** `NotificationBell.tsx` (en TopBar)

- Ícono de campanita (Tabler Icons: `IconBell`)
- Badge con `unreadCount` (si > 0)
- Al hacer clic → abre `NotificationDropdown`

### 4.5 Frontend: NotificationDropdown (componente)

**Archivo:** `NotificationDropdown.tsx`

- Panel flotante (abajo del bell)
- Tabs/pestañas de filtro: **Todos | DMs | Canales**
- Lista de notificaciones, cada una clickeable:
  - Al hacer clic → navega a `/dm/{userId}` o `/channels/{channelId}` y marca la notificación como leída
- Botón "**Marcar todas como leídas**" al fondo
- Si no hay notis: mensaje vacío "No hay notificaciones"

---

## 5. Frontend — Sidebar y /messages

### 5.1 Sidebar: Quitar badge de "Mensajes"

**Archivo:** `SidebarClient.tsx`

- Eliminar `showBadge` y el badge numérico del item "Mensajes"
- Dejar solo el highlight visual cuando la ruta actual es `/messages`

### 5.2 TopBar: Integrar NotificationBell

**Archivo:** `TopBarClient.tsx`

- Reemplazar el badge existente del bell (que estaba mirando canales y siempre 0) con `NotificationBell`
- El bell ahora obtiene `unreadCount` del `NotificationStore`

### 5.3 /messages: Mostrar último mensaje de canales

**Archivo:** `ConversationList.tsx`

- En lugar de `lastMessage: "Sin mensajes aún"` para canales, mostrar el `channel.lastMessage` (si existe)
- Usar el mismo formato que los DMs: `"username: contenido"`

---

## Resumen de Archivos a Modificar/Crear

### Backend (5 archivos)

| Archivo | Acción |
|---------|--------|
| `conversation.prisma.repository.ts` | Modificar: filtrar mensajes propios + setear `lastReadAt` al crear |
| `channel-member.repository.ts` | Agregar: `getUnreadCount` abstracto |
| `channel-member.prisma.repository.ts` | Agregar: implementación de `getUnreadCount` |
| `channels.controller.ts` | Agregar: endpoint `POST /channels/:id/read` + `lastMessage` en GET |
| `chat.gateway.ts` | Modificar: emitir `notification.new` al enviar mensajes |

### Backend (nuevos)

| Archivo | Acción |
|---------|--------|
| `mark-channel-read.usecase.ts` | Nuevo: use case para marcar canal como leído |

### Frontend (8 archivos)

| Archivo | Acción |
|---------|--------|
| `store/notification.store.ts` | **Nuevo**: Zustand store de notificaciones |
| `hooks/useRealtimeNotifications.ts` | **Nuevo**: listener socket de notificaciones |
| `components/notifications/NotificationBell.tsx` | **Nuevo**: ícono campanita con badge |
| `components/notifications/NotificationDropdown.tsx` | **Nuevo**: panel de notificaciones con filtros |
| `SidebarClient.tsx` | Modificar: quitar badge de "Mensajes" |
| `TopBarClient.tsx` | Modificar: integrar NotificationBell |
| `ConversationList.tsx` | Modificar: mostrar último mensaje de canales |
| `DMView.tsx` + channel view | Modificar: llamar markAsRead al montar |

---

## Orden de Implementación

1. **Backend DMs**: filtrar mensajes propios + `lastReadAt` al crear
2. **Backend canales**: `getUnreadCount` + endpoint mark-as-read + último mensaje en respuesta
3. **Frontend markAsRead**: conectar `markReadMutation` en DM/channel views
4. **Frontend /messages**: mostrar último mensaje de canales
5. **Backend notificaciones**: emitir `notification.new` por socket
6. **Frontend notificaciones**: store + bell + dropdown con filtros
7. **Frontend sidebar**: quitar badge de "Mensajes" + integrar bell en TopBar

---

## Casos Borde

- **Usuario recibe notificación de su propio mensaje**: NO debe ocurrir — el backend filtra al sender
- **Notificación duplicada**: La store de Zustand deduplica por `id`
- **Reconexión de socket**: Al reconectar, se re-sincronizan las notificaciones vía los queries de TanStack Query
- **Marcar todas como leídas vs entrar al chat**: Son operaciones independientes — la campanita y /messages tienen su propio estado de lectura
- **99+ notificaciones**: El badge muestra "99+" si hay más de 99 no-leídos
