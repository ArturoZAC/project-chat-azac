# 📚 API Documentation - Chat AZAC

Documentación completa de los endpoints disponibles en la API de Chat AZAC.

---

## 📖 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Canales](#canales)
4. [Mensajes](#mensajes)
5. [WebSockets](#websockets)
6. [Códigos de Error](#códigos-de-error)

---

## 🔐 Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación.

### Headers Requeridos

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Obtener Token

**Endpoint:** `POST /api/auth/login`

Request:
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

Response (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "user": {
    "id": "uuid-123",
    "email": "usuario@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

Response:
```json
{
  "access_token": "nuevo_token..."
}
```

---

## 👥 Usuarios

### Obtener Lista de Usuarios

**Endpoint:** `GET /api/users`

Query Parameters:
```
?page=1&limit=10&search=john&role=USER
```

Response (200 OK):
```json
{
  "data": [
    {
      "id": "uuid-123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "role": "USER",
      "isOnline": true,
      "createdAt": "2026-05-27T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Obtener Usuario por ID

**Endpoint:** `GET /api/users/:id`

Response (200 OK):
```json
{
  "id": "uuid-123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "role": "USER",
  "isOnline": true,
  "bio": "Software Developer",
  "createdAt": "2026-05-27T10:30:00Z",
  "updatedAt": "2026-05-27T15:45:00Z"
}
```

### Actualizar Perfil

**Endpoint:** `PATCH /api/users/:id`

Request:
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Senior Developer"
}
```

Response (200 OK):
```json
{
  "id": "uuid-123",
  "email": "user@example.com",
  "name": "John Updated",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Senior Developer",
  "updatedAt": "2026-05-27T16:00:00Z"
}
```

### Eliminar Usuario

**Endpoint:** `DELETE /api/users/:id`

Response (204 No Content)

### Cambiar Contraseña

**Endpoint:** `POST /api/users/:id/change-password`

Request:
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña"
}
```

Response (200 OK):
```json
{
  "message": "Contraseña actualizada correctamente"
}
```

### Solicitar Reset de Contraseña

**Endpoint:** `POST /api/auth/forgot-password`

Request:
```json
{
  "email": "user@example.com"
}
```

Response (200 OK):
```json
{
  "message": "Email de reset enviado"
}
```

### Reset de Contraseña

**Endpoint:** `POST /api/auth/reset-password`

Request:
```json
{
  "token": "token_del_email",
  "newPassword": "nueva_contraseña"
}
```

Response (200 OK):
```json
{
  "message": "Contraseña reseteada correctamente"
}
```

### Verificar Email

**Endpoint:** `POST /api/auth/verify-email`

Request:
```json
{
  "token": "token_verificacion"
}
```

Response (200 OK):
```json
{
  "message": "Email verificado correctamente"
}
```

---

## 💬 Canales

### Obtener Lista de Canales

**Endpoint:** `GET /api/channels`

Query Parameters:
```
?page=1&limit=20&type=public&search=general
```

Response (200 OK):
```json
{
  "data": [
    {
      "id": "channel-uuid-123",
      "name": "general",
      "description": "Canal general de conversación",
      "type": "PUBLIC",
      "owner": {
        "id": "user-uuid",
        "name": "John Doe"
      },
      "members": 25,
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Crear Canal

**Endpoint:** `POST /api/channels`

Request:
```json
{
  "name": "proyecto-x",
  "description": "Canal para el proyecto X",
  "type": "PRIVATE"
}
```

Response (201 Created):
```json
{
  "id": "channel-uuid-123",
  "name": "proyecto-x",
  "description": "Canal para el proyecto X",
  "type": "PRIVATE",
  "owner": {
    "id": "user-uuid",
    "name": "John Doe"
  },
  "members": 1,
  "createdAt": "2026-05-27T16:30:00Z"
}
```

### Obtener Canal por ID

**Endpoint:** `GET /api/channels/:id`

Response (200 OK):
```json
{
  "id": "channel-uuid-123",
  "name": "general",
  "description": "Canal general",
  "type": "PUBLIC",
  "owner": { ... },
  "members": [ ... ],
  "createdAt": "2026-05-01T10:00:00Z"
}
```

### Actualizar Canal

**Endpoint:** `PATCH /api/channels/:id`

Request:
```json
{
  "name": "general-updated",
  "description": "Descripción actualizada"
}
```

Response (200 OK): Canal actualizado

### Eliminar Canal

**Endpoint:** `DELETE /api/channels/:id`

Response (204 No Content)

### Obtener Miembros del Canal

**Endpoint:** `GET /api/channels/:id/members`

Response (200 OK):
```json
{
  "data": [
    {
      "id": "member-uuid",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "role": "OWNER",
      "joinedAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

### Añadir Miembro a Canal

**Endpoint:** `POST /api/channels/:id/members`

Request:
```json
{
  "userId": "user-uuid-456",
  "role": "MEMBER"
}
```

Response (201 Created): Miembro añadido

### Remover Miembro del Canal

**Endpoint:** `DELETE /api/channels/:id/members/:userId`

Response (204 No Content)

### Cambiar Rol de Miembro

**Endpoint:** `PATCH /api/channels/:id/members/:userId`

Request:
```json
{
  "role": "ADMIN"
}
```

Response (200 OK): Rol actualizado

---

## 📨 Mensajes

### Obtener Mensajes del Canal

**Endpoint:** `GET /api/channels/:channelId/messages`

Query Parameters:
```
?page=1&limit=50&sort=desc
```

Response (200 OK):
```json
{
  "data": [
    {
      "id": "msg-uuid-123",
      "content": "Hola a todos!",
      "author": {
        "id": "user-uuid",
        "name": "John Doe",
        "avatar": "..."
      },
      "channel": {
        "id": "channel-uuid",
        "name": "general"
      },
      "replyTo": null,
      "readBy": [
        {
          "userId": "user-uuid-2",
          "readAt": "2026-05-27T10:35:00Z"
        }
      ],
      "createdAt": "2026-05-27T10:30:00Z",
      "updatedAt": "2026-05-27T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Enviar Mensaje

**Endpoint:** `POST /api/channels/:channelId/messages`

Request:
```json
{
  "content": "Contenido del mensaje",
  "replyTo": "msg-uuid-padre" // Opcional, para respuestas
}
```

Response (201 Created):
```json
{
  "id": "msg-uuid-new",
  "content": "Contenido del mensaje",
  "author": { ... },
  "channel": { ... },
  "createdAt": "2026-05-27T16:45:00Z"
}
```

### Editar Mensaje

**Endpoint:** `PATCH /api/channels/:channelId/messages/:messageId`

Request:
```json
{
  "content": "Contenido actualizado"
}
```

Response (200 OK): Mensaje actualizado

### Eliminar Mensaje

**Endpoint:** `DELETE /api/channels/:channelId/messages/:messageId`

Response (204 No Content)

### Marcar Mensaje como Leído

**Endpoint:** `POST /api/channels/:channelId/messages/:messageId/read`

Response (200 OK):
```json
{
  "message": "Mensaje marcado como leído"
}
```

### Obtener Respuestas de un Mensaje

**Endpoint:** `GET /api/channels/:channelId/messages/:messageId/replies`

Response (200 OK):
```json
{
  "data": [
    {
      "id": "reply-uuid",
      "content": "Respuesta al mensaje",
      "author": { ... },
      "createdAt": "2026-05-27T10:40:00Z"
    }
  ]
}
```

---

## 🔌 WebSockets

Los WebSockets están disponibles en `/socket.io` para mensajería en tiempo real.

### Connection

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3100', {
  auth: {
    token: 'jwt_token_aqui'
  }
});
```

### Eventos de Cliente

**Conectar a Canal**
```typescript
socket.emit('join_channel', {
  channelId: 'channel-uuid-123'
});
```

**Enviar Mensaje en Tiempo Real**
```typescript
socket.emit('send_message', {
  channelId: 'channel-uuid',
  content: 'Mensaje en tiempo real'
});
```

**Marcar Escritura**
```typescript
socket.emit('typing', {
  channelId: 'channel-uuid-123'
});
```

**Salir de Canal**
```typescript
socket.emit('leave_channel', {
  channelId: 'channel-uuid-123'
});
```

### Eventos del Servidor

**Nuevo Mensaje**
```typescript
socket.on('message_received', (data) => {
  console.log('Nuevo mensaje:', data);
  // data = { id, content, author, createdAt, ... }
});
```

**Usuario Escribiendo**
```typescript
socket.on('user_typing', (data) => {
  console.log('Usuario escribiendo:', data);
  // data = { userId, userName }
});
```

**Usuario Conectado**
```typescript
socket.on('user_connected', (data) => {
  console.log('Usuario conectado:', data);
});
```

**Usuario Desconectado**
```typescript
socket.on('user_disconnected', (data) => {
  console.log('Usuario desconectado:', data);
});
```

**Mensaje Actualizado**
```typescript
socket.on('message_updated', (data) => {
  console.log('Mensaje actualizado:', data);
});
```

**Mensaje Eliminado**
```typescript
socket.on('message_deleted', (data) => {
  console.log('Mensaje eliminado:', data);
  // data = { messageId }
});
```

---

## ⚠️ Códigos de Error

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validación fallida",
  "errors": [
    {
      "field": "email",
      "message": "Email no válido"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "No autorizado - Token inválido o expirado"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "No tienes permiso para acceder a este recurso"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Recurso no encontrado"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "El recurso ya existe",
  "errors": {
    "email": "Este email ya está registrado"
  }
}
```

### 422 Unprocessable Entity

```json
{
  "statusCode": 422,
  "message": "No se puede procesar la solicitud"
}
```

### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Demasiadas solicitudes - Intenta más tarde"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Error interno del servidor",
  "error": "Error message"
}
```

---

## 🔄 Paginación

Todos los endpoints que devuelven listas soportan paginación:

```
GET /api/users?page=2&limit=10
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

## 🔍 Filtros y Búsqueda

Muchos endpoints soportan filtros:

```
GET /api/users?search=john&role=ADMIN&isOnline=true&sort=-createdAt
```

---

## 📊 Rate Limiting

La API implementa rate limiting:

**Headers de Respuesta:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1622203200
```

Límite: 100 requests por 15 minutos por IP/usuario.

---

## 📝 Changelog

### v0.0.1 (2026-05-27)
- ✅ Endpoints de Usuarios
- ⏳ Endpoints de Canales (en desarrollo)
- ⏳ Endpoints de Mensajes (en desarrollo)
- ⏳ WebSockets (en desarrollo)

---

**Última actualización:** May 27, 2026
