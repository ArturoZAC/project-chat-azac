<div align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</div>

# 💬 Chat AZAC - Backend

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?logo=prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-010101?logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/License-UNLICENSED-red)
![Version](https://img.shields.io/badge/Version-0.0.1-blue)

Backend API escalable y moderno para una aplicación de chat colaborativa en tiempo real con NestJS + Socket.io.

</div>

---

## 📖 Tabla de Contenidos

1. [Descripción](#descripción)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Características](#-características-principales)
4. [Requisitos Previos](#-requisitos-previos)
5. [Instalación y Setup](#-instalación)
6. [Uso y Comandos](#-uso)
7. [Estructura del Proyecto](#-estructura-del-proyecto)
8. [Base de Datos](#️-base-de-datos)
9. [API Endpoints](#-api-endpoints)
10. [Documentación Detallada](#-documentación-de-api)
11. [Arquitectura](#️-arquitectura)
12. [Calidad de Código](#-calidad-de-código)
13. [Variables de Entorno](#-variables-de-entorno)
14. [Deployment](#-deployment)
15. [Scripts y Troubleshooting](#️-troubleshooting)
16. [Contribución](#-contribución)
17. [Links Útiles](#-links-útiles)

---

## 📋 Descripción

**Chat AZAC** es el backend de una plataforma de mensajería colaborativa construida con **NestJS** y **TypeScript**. Proporciona una API REST robusta con soporte para:

- 👥 Gestión completa de usuarios
- 💬 Sistema de canales públicos y privados
- 📨 Mensajería en tiempo real (WebSockets con Socket.io)
- 🔐 Autenticación basada en JWT
- 📧 Sistema de notificaciones por correo electrónico
- 📖 Seguimiento de lectura de mensajes
- 🔑 Control de acceso basado en roles

El proyecto sigue principios de **Clean Architecture** y **SOLID**, asegurando código mantenible, escalable y fácil de testear.

---

## 🛠️ Stack Tecnológico

| Componente             | Tecnología              | Versión        |
| ---------------------- | ----------------------- | -------------- |
| **Framework**          | NestJS                  | 11.0.1         |
| **Lenguaje**           | TypeScript              | 5.7.3          |
| **Base de Datos**      | PostgreSQL              | 15+            |
| **ORM**                | Prisma                  | 7.8.0          |
| **Autenticación**      | JWT                     | -              |
| **WebSockets**         | Socket.io               | 4.8.3          |
| **Email**              | Nodemailer + Handlebars | 8.0.8          |
| **Logging**            | Winston                 | 3.19.0         |
| **Validación**         | Zod + class-validator   | 4.4.3 + 0.15.1 |
| **Gestor de Paquetes** | pnpm                    | Latest         |

---

## ✨ Características Principales

### 👥 Gestión de Usuarios

- ✅ Registro y autenticación con JWT
- ✅ Verificación de correo electrónico
- ✅ Recuperación de contraseña
- ✅ Perfil de usuario (avatar, nombre, bio, etc.)
- ✅ Sistema de roles (USER, ADMIN)
- ✅ Estado online/offline en tiempo real

### 💬 Sistema de Canales

- ✅ Crear canales públicos y privados
- ✅ Gestionar miembros del canal
- ✅ Asignar roles dentro del canal (OWNER, MEMBER, GUEST)
- ✅ Seguimiento de última lectura por usuario
- ✅ Descripción y metadatos de canales

### 📨 Mensajería

- ✅ Enviar mensajes en canales
- ✅ Editar y eliminar mensajes
- ✅ Respuestas/Threads de mensajes
- ✅ Marcado de mensajes como leídos por múltiples usuarios
- ✅ Timestamps automáticos
- ✅ Notificaciones en tiempo real

### 🔐 Seguridad

- ✅ Autenticación con JWT (access tokens)
- ✅ Hash de contraseñas con bcryptjs
- ✅ Validación de entrada con Zod y class-validator
- ✅ Tokens de verificación de email con expiración
- ✅ Tokens de reset de contraseña con expiración
- ✅ Guards de autorización por rol

### ⚡ Real-Time

- ✅ WebSockets con Socket.io para mensajería en vivo
- ✅ Notificaciones instantáneas de nuevos mensajes
- ✅ Indicadores de conexión/desconexión de usuarios
- ✅ Sincronización en tiempo real de estados

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** ≥ 18.x
- **pnpm** ≥ 8.x ([Instalar pnpm](https://pnpm.io/installation))
- **PostgreSQL** ≥ 15 ([Descargar PostgreSQL](https://www.postgresql.org/download/))
- **Git** ≥ 2.x

Verifica que todo está instalado correctamente:

```bash
node --version      # v18.x.x o superior
pnpm --version      # 8.x.x o superior
postgres --version  # postgres 15 o superior
```

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd project-chat-azac/backend
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/chat_azac

# Servidor
PORT=3100
NODE_ENV=development

# JWT
JWT_SECRET=tu_secreto_muy_seguro_aqui
JWT_EXPIRES_IN=1d

# Configuración de Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_contraseña_app
MAIL_FROM=noreply@chatazac.com

# URLs
APP_URL=http://localhost:3100
CLIENT_URL=http://localhost:5173
```

### 4. Configurar base de datos

```bash
# Crear base de datos
createdb chat_azac

# Ejecutar migraciones
pnpm run prisma:migrate:deploy

# (Opcional) Poblar con datos de prueba
pnpm run seed
```

---

## 🎯 Uso

### Modo Desarrollo

```bash
# Iniciar servidor en modo watch (recarga automática)
pnpm run start:dev

# El servidor estará disponible en http://localhost:3100
```

### Producción

```bash
# Compilar TypeScript a JavaScript
pnpm run build

# Ejecutar en producción
pnpm run start:prod
```

### Debug

```bash
# Iniciar servidor con debugger habilitado
pnpm run start:debug

# Se abrirá en: chrome://inspect
```

---

## 🧪 Testing

```bash
# Ejecutar tests unitarios
pnpm run test

# Modo watch (re-ejecutar al guardar)
pnpm run test:watch

# Coverage de pruebas
pnpm run test:cov

# Tests end-to-end (e2e)
pnpm run test:e2e

# Debug de tests
pnpm run test:debug
```

---

## 📊 Estructura del Proyecto

```
src/
├── main.ts                                   # Punto de entrada de la aplicación
├── app.module.ts                             # Módulo raíz (importa todos los módulos)
│
├── config/
│   └── envs.ts                               # Validación de variables de entorno (Zod)
│
├── application/                              # Use Cases (Lógica de aplicación)
│   └── use-cases/
│       ├── auth/
│       │   ├── forgot-password.usecase.ts
│       │   ├── login.usecase.ts
│       │   ├── register.usecase.ts
│       │   ├── reset-password.usecase.ts
│       │   ├── verify-email.usecase.ts
│       │   └── verify-email.dto.ts
│       │
│       ├── channels/
│       │   ├── create-channel.usecase.ts
│       │   ├── delete-channel.usecase.ts
│       │   ├── get-channel.usecase.ts
│       │   ├── get-channels.usecase.ts
│       │   ├── join-channel.usecase.ts
│       │   ├── leave-channel.usecase.ts
│       │   └── update-channel.usecase.ts
│       │
│       ├── messages/
│       │   ├── delete-message.usecase.ts
│       │   ├── edit-message.usecase.ts
│       │   ├── get-messages.usecase.ts
│       │   └── send-message.usecase.ts
│       │
│       └── users/
│           ├── delete-user.usecase.ts
│           ├── get-user.usecase.ts
│           ├── get-users.usecase.ts
│           └── update-user.usecase.ts
│
├── domain/                                   # Entities & Interfaces
│   ├── entities/
│   │   ├── channel-member.entity.ts
│   │   ├── channel.entity.ts
│   │   ├── email-verification.entity.ts
│   │   ├── message.entity.ts
│   │   ├── password-reset.entity.ts
│   │   └── user.entity.ts
│   │
│   └── repositories/                         # Repository Interfaces (Contratos)
│       ├── channel-member.repository.ts
│       ├── channel.repository.ts
│       ├── email-verification.repository.ts
│       ├── message.repository.ts
│       ├── password-reset.repository.ts
│       └── user.repository.ts
│
├── infrastructure/                           # Implementaciones (BD, Logger, Email, etc.)
│   ├── auth/
│   │   └── jwt.strategy.ts                   # Estrategia JWT de Passport
│   │
│   ├── logger/
│   │   ├── logger.module.ts
│   │   └── winston.logger.ts                 # Logger con Winston
│   │
│   ├── mail/
│   │   ├── mail.module.ts
│   │   ├── mail.service.ts                   # Servicio de email (Nodemailer)
│   │   └── templates/
│   │       ├── reset-password.hbs
│   │       └── verify-email.hbs
│   │
│   └── prisma/                               # Prisma ORM
│       ├── prisma.module.ts
│       ├── prisma.service.ts                 # Servicio de conexión a BD
│       │
│       ├── mappers/                          # Transformación de datos
│       │   ├── channel-member.mapper.ts
│       │   ├── channel.mapper.ts
│       │   ├── email-verification.mapper.ts
│       │   ├── message.mapper.ts
│       │   ├── password-reset.mapper.ts
│       │   └── user.mapper.ts
│       │
│       └── repositories/                     # Implementación de Repositorios
│           ├── channel-member.prisma.repository.ts
│           ├── channel.prisma.repository.ts
│           ├── email-verification.prisma.repository.ts
│           ├── message.prisma.repository.ts
│           ├── password-reset.prisma.repository.ts
│           └── user.prisma.repository.ts
│
└── presentation/                             # HTTP API + WebSockets
    ├── filters/
    │   └── http-exception.filter.ts          # Manejo global de excepciones
    │
    ├── interceptors/
    │   ├── logging.interceptor.ts            # Interceptor de logging
    │   └── response.interceptor.ts           # Interceptor de formateo de respuestas
    │
    ├── http/                                 # REST API Endpoints
    │   ├── auth/
    │   │   ├── auth.controller.ts            # Endpoints: login, register, verify, etc.
    │   │   ├── auth.module.ts
    │   │   └── dtos/
    │   │       ├── forgot-password.dto.ts
    │   │       ├── login.dto.ts
    │   │       ├── register.dto.ts
    │   │       └── reset-password.dto.ts
    │   │
    │   ├── channels/
    │   │   ├── channels.controller.ts        # Endpoints: crear, listar, actualizar canales
    │   │   ├── channels.module.ts
    │   │   └── dtos/
    │   │       ├── create-channel.dto.ts
    │   │       ├── get-channels.dto.ts
    │   │       └── update-channel.dto.ts
    │   │
    │   ├── messages/
    │   │   ├── messages.controller.ts        # Endpoints: enviar, editar, eliminar mensajes
    │   │   ├── messages.module.ts
    │   │   └── dtos/
    │   │       ├── edit-message.dto.ts
    │   │       ├── get-messages.dto.ts
    │   │       └── send-message.dto.ts
    │   │
    │   ├── users/
    │   │   ├── users.controller.ts           # Endpoints: obtener, actualizar usuarios
    │   │   ├── users.module.ts
    │   │   └── dtos/
    │   │       ├── get-users.dto.ts
    │   │       └── update-user.dto.ts
    │   │
    │   ├── decorators/                       # Decoradores personalizados
    │   │   ├── auth.decorator.ts
    │   │   ├── public.decorator.ts
    │   │   └── roles.decorator.ts
    │   │
    │   └── guards/                           # Guards de autorización
    │       ├── jwt-auth.guard.ts
    │       └── roles.guard.ts
    │
    └── websocket/                            # WebSockets en tiempo real
        ├── chat.gateway.ts                   # Gateway de Socket.io
        └── chat.module.ts                    # Módulo de WebSockets
```

### Arquitectura

El proyecto sigue **Clean Architecture** con separación de capas:

- **Presentation Layer** (HTTP): Controllers, DTOs, Pipes, Filters, Interceptors
- **Application Layer**: Use Cases con lógica de aplicación
- **Domain Layer**: Entidades y interfaces de repositorios
- **Infrastructure Layer**: Implementaciones de repositorios, BD, Logger, etc.

---

## 🗄️ Base de Datos

### Modelo de Datos (Prisma Schema)

El esquema de base de datos incluye las siguientes entidades:

| Entidad               | Descripción                                           |
| --------------------- | ----------------------------------------------------- |
| **User**              | Usuarios del sistema (email, contraseña, perfil, rol) |
| **Channel**           | Canales de comunicación (público/privado)             |
| **ChannelMember**     | Membresía de usuarios en canales                      |
| **Message**           | Mensajes dentro de canales                            |
| **MessageRead**       | Control de quién leyó cada mensaje                    |
| **EmailVerification** | Tokens para verificación de email                     |
| **PasswordReset**     | Tokens para reset de contraseña                       |

### Migraciones

Ver migraciones ejecutadas:

```bash
# Ver estado de migraciones
pnpm run prisma:migrate:status

# Crear nueva migración después de cambiar schema.prisma
pnpm run prisma:migrate:dev --name nombre_migracion

# Revertir cambios de desarrollo
pnpm run prisma:migrate:resolve --rolled-back nombre_migracion
```

### Prisma Studio

Visualizar y editar datos de BD de forma gráfica:

```bash
pnpm run prisma:studio
```

Se abrirá en `http://localhost:5555`

---

## 🔌 API Endpoints

### Autenticación

| Método   | Endpoint                    | Descripción                   |
| -------- | --------------------------- | ----------------------------- |
| **POST** | `/api/auth/register`        | Registrar nuevo usuario       |
| **POST** | `/api/auth/login`           | Login con email y contraseña  |
| **POST** | `/api/auth/verify-email`    | Verificar email con token     |
| **POST** | `/api/auth/forgot-password` | Solicitar reset de contraseña |
| **POST** | `/api/auth/reset-password`  | Resetear contraseña con token |

### Usuarios

| Método     | Endpoint         | Descripción                          |
| ---------- | ---------------- | ------------------------------------ |
| **GET**    | `/api/users`     | Obtener lista de usuarios (paginado) |
| **GET**    | `/api/users/:id` | Obtener usuario por ID               |
| **PATCH**  | `/api/users/:id` | Actualizar perfil de usuario         |
| **DELETE** | `/api/users/:id` | Eliminar usuario                     |

### Canales

| Método     | Endpoint                            | Descripción                |
| ---------- | ----------------------------------- | -------------------------- |
| **GET**    | `/api/channels`                     | Obtener lista de canales   |
| **POST**   | `/api/channels`                     | Crear nuevo canal          |
| **GET**    | `/api/channels/:id`                 | Obtener canal por ID       |
| **PATCH**  | `/api/channels/:id`                 | Actualizar canal           |
| **DELETE** | `/api/channels/:id`                 | Eliminar canal             |
| **GET**    | `/api/channels/:id/members`         | Obtener miembros del canal |
| **POST**   | `/api/channels/:id/members`         | Añadir miembro al canal    |
| **DELETE** | `/api/channels/:id/members/:userId` | Remover miembro del canal  |

### Mensajes

| Método     | Endpoint                                            | Descripción                |
| ---------- | --------------------------------------------------- | -------------------------- |
| **GET**    | `/api/channels/:channelId/messages`                 | Obtener mensajes del canal |
| **POST**   | `/api/channels/:channelId/messages`                 | Enviar mensaje             |
| **PATCH**  | `/api/channels/:channelId/messages/:messageId`      | Editar mensaje             |
| **DELETE** | `/api/channels/:channelId/messages/:messageId`      | Eliminar mensaje           |
| **POST**   | `/api/channels/:channelId/messages/:messageId/read` | Marcar como leído          |

### WebSockets (Real-Time)

El servidor mantiene una conexión WebSocket con Socket.io en `http://localhost:3100` con los siguientes eventos:

---

## 🧹 Calidad de Código

### Lint

```bash
# Ejecutar ESLint con correcciones automáticas
pnpm run lint

# Verificar sin corregir
pnpm run lint -- --no-fix
```

### Formato

```bash
# Formatear código con Prettier
pnpm run format
```

---

## 🔐 Variables de Entorno

### Requeridas

- `DATABASE_URL` - Conexión PostgreSQL
- `JWT_SECRET` - Clave secreta para JWT

### Opcionales

- `PORT` - Puerto del servidor (default: 3100)
- `NODE_ENV` - environment (development, production, test)
- `JWT_EXPIRES_IN` - Expiración de JWT (default: 1d)
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` - Configuración SMTP
- `APP_URL` - URL de la aplicación (default: http://localhost:3100)
- `CLIENT_URL` - URL del cliente (default: http://localhost:5173)

---

## 🚢 Deployment

### Build para Producción

```bash
pnpm run build
```

### Ejecutar en Producción

```bash
pnpm run start:prod
```

### Variables de Entorno en Producción

Asegúrate de configurar variables de entorno seguras:

```bash
DATABASE_URL=postgresql://prod_user:secure_pass@prod_host:5432/chat_azac
JWT_SECRET=clave_secreta_muy_segura_y_larga
NODE_ENV=production
```

---

## 📝 Scripts Disponibles

| Script                 | Descripción                   |
| ---------------------- | ----------------------------- |
| `pnpm run start`       | Iniciar servidor              |
| `pnpm run start:dev`   | Modo desarrollo con watch     |
| `pnpm run start:debug` | Modo debug con inspector      |
| `pnpm run start:prod`  | Modo producción               |
| `pnpm run build`       | Compilar TypeScript           |
| `pnpm run lint`        | Ejecutar ESLint con fix       |
| `pnpm run format`      | Formatear con Prettier        |
| `pnpm run test`        | Ejecutar tests unitarios      |
| `pnpm run test:watch`  | Tests en modo watch           |
| `pnpm run test:cov`    | Coverage de tests             |
| `pnpm run test:e2e`    | Tests end-to-end              |
| `pnpm run seed`        | Poblar BD con datos de prueba |

---

## 🐛 Troubleshooting

### Error: `connect ECONNREFUSED` en PostgreSQL

**Problema**: No se puede conectar a la base de datos.

**Solución**:

1. Verifica que PostgreSQL está corriendo: `sudo service postgresql status`
2. Confirma que DATABASE_URL es correcto en `.env`
3. Crea la base de datos: `createdb chat_azac`

### Error: `Missing environment variable`

**Problema**: Falta configurar variables de entorno.

**Solución**:

1. Copia `.env.example` a `.env`: `cp .env.example .env`
2. Completa los valores requeridos en `.env`

### Error de Migraciones

**Problema**: Las migraciones no se aplican correctamente.

**Solución**:

```bash
# Ver estado
pnpm run prisma:migrate:status

# Resetear en desarrollo (SOLO desarrollo)
pnpm run prisma:migrate:reset
```

---

## 📚 Documentación de API

### 🔐 Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación. Incluye el token en el header `Authorization`:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Login

**Endpoint:** `POST /api/auth/login`

**Request:**

```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response (200 OK):**

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

#### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Response (200 OK):**

```json
{
  "access_token": "nuevo_token..."
}
```

#### Verify Email

**Endpoint:** `POST /api/auth/verify-email`

**Request:**

```json
{
  "token": "token_verificacion"
}
```

**Response (200 OK):**

```json
{
  "message": "Email verificado correctamente"
}
```

#### Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "message": "Email de reset enviado"
}
```

#### Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request:**

```json
{
  "token": "token_del_email",
  "newPassword": "nueva_contraseña"
}
```

**Response (200 OK):**

```json
{
  "message": "Contraseña reseteada correctamente"
}
```

---

### 👥 Usuarios

#### Obtener Lista de Usuarios

**Endpoint:** `GET /api/users`

**Query Parameters:**

```
?page=1&limit=10&search=john&role=USER
```

**Response (200 OK):**

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

#### Obtener Usuario por ID

**Endpoint:** `GET /api/users/:id`

**Response (200 OK):**

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

#### Actualizar Perfil

**Endpoint:** `PATCH /api/users/:id`

**Request:**

```json
{
  "name": "John Updated",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Senior Developer"
}
```

**Response (200 OK):**

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

#### Cambiar Contraseña

**Endpoint:** `POST /api/users/:id/change-password`

**Request:**

```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña"
}
```

**Response (200 OK):**

```json
{
  "message": "Contraseña actualizada correctamente"
}
```

#### Eliminar Usuario

**Endpoint:** `DELETE /api/users/:id`

**Response (204 No Content)**

---

### 💬 Canales

#### Obtener Lista de Canales

**Endpoint:** `GET /api/channels`

**Query Parameters:**

```
?page=1&limit=20&type=public&search=general
```

**Response (200 OK):**

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

#### Crear Canal

**Endpoint:** `POST /api/channels`

**Request:**

```json
{
  "name": "proyecto-x",
  "description": "Canal para el proyecto X",
  "type": "PRIVATE"
}
```

**Response (201 Created):**

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

#### Obtener Canal por ID

**Endpoint:** `GET /api/channels/:id`

**Response (200 OK):**

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

#### Actualizar Canal

**Endpoint:** `PATCH /api/channels/:id`

**Request:**

```json
{
  "name": "general-updated",
  "description": "Descripción actualizada"
}
```

**Response (200 OK):** Canal actualizado

#### Eliminar Canal

**Endpoint:** `DELETE /api/channels/:id`

**Response (204 No Content)**

#### Obtener Miembros del Canal

**Endpoint:** `GET /api/channels/:id/members`

**Response (200 OK):**

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

#### Añadir Miembro a Canal

**Endpoint:** `POST /api/channels/:id/members`

**Request:**

```json
{
  "userId": "user-uuid-456",
  "role": "MEMBER"
}
```

**Response (201 Created):** Miembro añadido

#### Remover Miembro del Canal

**Endpoint:** `DELETE /api/channels/:id/members/:userId`

**Response (204 No Content)**

#### Cambiar Rol de Miembro

**Endpoint:** `PATCH /api/channels/:id/members/:userId`

**Request:**

```json
{
  "role": "ADMIN"
}
```

**Response (200 OK):** Rol actualizado

---

### 📨 Mensajes

#### Obtener Mensajes del Canal

**Endpoint:** `GET /api/channels/:channelId/messages`

**Query Parameters:**

```
?page=1&limit=50&sort=desc
```

**Response (200 OK):**

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

#### Enviar Mensaje

**Endpoint:** `POST /api/channels/:channelId/messages`

**Request:**

```json
{
  "content": "Contenido del mensaje",
  "replyTo": "msg-uuid-padre"
}
```

**Response (201 Created):**

```json
{
  "id": "msg-uuid-new",
  "content": "Contenido del mensaje",
  "author": { ... },
  "channel": { ... },
  "createdAt": "2026-05-27T16:45:00Z"
}
```

#### Editar Mensaje

**Endpoint:** `PATCH /api/channels/:channelId/messages/:messageId`

**Request:**

```json
{
  "content": "Contenido actualizado"
}
```

**Response (200 OK):** Mensaje actualizado

#### Eliminar Mensaje

**Endpoint:** `DELETE /api/channels/:channelId/messages/:messageId`

**Response (204 No Content)**

#### Marcar Mensaje como Leído

**Endpoint:** `POST /api/channels/:channelId/messages/:messageId/read`

**Response (200 OK):**

```json
{
  "message": "Mensaje marcado como leído"
}
```

#### Obtener Respuestas de un Mensaje

**Endpoint:** `GET /api/channels/:channelId/messages/:messageId/replies`

**Response (200 OK):**

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

### 🔌 WebSockets (Real-Time Communication)

Conexión en tiempo real con Socket.io para eventos instantáneos:

#### Autenticación WebSocket

```javascript
const socket = io('http://localhost:3100', {
  auth: {
    token: 'jwt_token_aqui',
  },
});

socket.on('connect', () => {
  console.log('Conectado al servidor WebSocket');
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});
```

#### Eventos de Mensajes

**Enviar mensaje en tiempo real:**

```javascript
socket.emit('message:send', {
  channelId: 'channel-uuid',
  content: 'Contenido del mensaje',
});

// Todos en el canal reciben el nuevo mensaje
socket.on('message:new', (message) => {
  console.log('Nuevo mensaje:', message);
});
```

**Editar mensaje:**

```javascript
socket.emit('message:edit', {
  messageId: 'msg-uuid',
  content: 'Contenido actualizado',
});

socket.on('message:updated', (message) => {
  console.log('Mensaje actualizado:', message);
});
```

**Eliminar mensaje:**

```javascript
socket.emit('message:delete', {
  messageId: 'msg-uuid',
  channelId: 'channel-uuid',
});

socket.on('message:deleted', ({ messageId }) => {
  console.log('Mensaje eliminado:', messageId);
});
```

**Marcar como leído:**

```javascript
socket.emit('message:read', {
  messageId: 'msg-uuid',
  channelId: 'channel-uuid',
});

socket.on('message:read:updated', (readData) => {
  console.log('Usuarios que leyeron:', readData);
});
```

#### Eventos de Usuarios

**Indicador de escritura (typing):**

```javascript
socket.emit('user:typing', {
  channelId: 'channel-uuid',
});

socket.on('user:typing', (data) => {
  console.log('Usuario escribiendo:', data);
});

socket.emit('user:stop-typing', {
  channelId: 'channel-uuid',
});
```

**Estado de usuario (online/offline):**

```javascript
socket.on('user:online', (data) => {
  console.log('Usuario conectado:', data.userId, data.name);
});

socket.on('user:offline', (data) => {
  console.log('Usuario desconectado:', data.userId);
});
```

#### Eventos de Canales

**Unirse a canal:**

```javascript
socket.emit('channel:join', {
  channelId: 'channel-uuid',
});

socket.on('channel:user-joined', (data) => {
  console.log('Nuevo miembro:', data);
});
```

**Salir del canal:**

```javascript
socket.emit('channel:leave', {
  channelId: 'channel-uuid',
});

socket.on('channel:user-left', (data) => {
  console.log('Miembro salió:', data);
});
```

#### Eventos de Notificaciones

```javascript
// Notificación de nuevos mensajes
socket.on('notification:message', (data) => {
  console.log('Nueva notificación:', data.message);
});

// Actualización de estado de canal
socket.on('channel:updated', (channel) => {
  console.log('Canal actualizado:', channel);
});
```

---

## 🏗️ Arquitectura

El proyecto implementa **Clean Architecture** (también conocida como Hexagonal Architecture) para garantizar:

- ✅ **Independencia de frameworks** - La lógica de negocio no depende de NestJS
- ✅ **Testabilidad** - Fácil de testear sin dependencias externas
- ✅ **Mantenibilidad** - Código organizado y coherente
- ✅ **Escalabilidad** - Fácil de agregar nuevas funcionalidades

### Capas de la Arquitectura

```
┌─────────────────────────────────────┐
│     Presentation Layer (HTTP)       │ ← Controllers, DTOs, Interceptors
├─────────────────────────────────────┤
│     Application Layer               │ ← Use Cases, Validators
├─────────────────────────────────────┤
│     Domain Layer                    │ ← Entities, Interfaces, Business Logic
├─────────────────────────────────────┤
│     Infrastructure Layer            │ ← Prisma, Database, Logger
└─────────────────────────────────────┘
```

### 1. Presentation Layer

**Responsabilidades:**

- Recibir solicitudes HTTP
- Validar entrada de datos (DTOs)
- Formatear respuestas
- Manejar excepciones HTTP
- Logging de solicitudes

**Componentes:**

- Controllers (endpoints REST)
- DTOs (Data Transfer Objects)
- Guards (autorización)
- Filters (manejo de excepciones)
- Interceptors (logging, response formatting)

### 2. Application Layer

**Responsabilidades:**

- Implementar casos de uso
- Orquestar operaciones
- Validación de lógica de aplicación
- Llamar a repositorios

**Componentes:**

- Use Cases (inyectable con @Injectable())
- Una clase = Un caso de uso
- Inyección de dependencias

### 3. Domain Layer

**Responsabilidades:**

- Definir entidades
- Especificar interfaces de repositorios
- Reglas de negocio núcleo
- Valores constantes del negocio

**Características:**

- No depende de NestJS
- Reglas de negocio puras
- Interfaces de repositorios (contrato)

### 4. Infrastructure Layer

**Responsabilidades:**

- Implementar interfaces de repositorios
- Gestionar base de datos (Prisma)
- Logging con Winston
- Configuración externa

**Componentes:**

- Implementaciones de Repositories
- Mappers (transformación de datos)
- PrismaService
- LoggerService
- MailService

### Patrones de Diseño

#### Repository Pattern

Abstrae el acceso a datos:

```typescript
// Domain - Interfaz
interface IUserRepository {
  findById(id: string): Promise<User>;
  create(user: User): Promise<User>;
}

// Infrastructure - Implementación
@Injectable()
class UserPrismaRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }
}

// Application - Uso
@Injectable()
class GetUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: string): Promise<User> {
    return this.repo.findById(id);
  }
}
```

#### Use Case Pattern

Cada operación es un use case independiente:

```typescript
@Injectable()
export class GetUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(id: string): Promise<User> {
    this.logger.log('Obteniendo usuario...');
    return this.userRepository.findById(id);
  }
}
```

#### Mapper Pattern

Transforma datos entre capas:

```typescript
export class UserMapper {
  // Prisma → Domain
  static toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
    });
  }

  // Domain → Prisma
  static toPersistence(user: User): Prisma.UserCreateInput {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
```

### Flujo de una Solicitud

```
1. HTTP Request llega al Controller
   ↓
2. Controller valida DTO (class-validator)
   ↓
3. Controller llama al Use Case
   ↓
4. Use Case contiene lógica de negocio
   ↓
5. Use Case llama al Repository (Domain interface)
   ↓
6. Repository (Infrastructure) accede a Prisma
   ↓
7. Prisma consulta la base de datos
   ↓
8. Mapper transforma datos (Prisma → Domain)
   ↓
9. Use Case devuelve resultado
   ↓
10. ResponseInterceptor formatea respuesta
    ↓
11. HTTP Response se envía al cliente
```

---

## 🤝 Contribución

Gracias por tu interés en contribuir a **Chat AZAC**. Este documento te guiará sobre cómo hacerlo efectivamente.

### Código de Conducta

- Sé respetuoso con todos los miembros de la comunidad
- Proporciona feedback constructivo
- Enfócate en lo que es mejor para la comunidad
- Muestra empatía hacia otros miembros

### Reportar Bugs

#### Antes de reportar

- Verifica si el bug ya ha sido reportado en Issues
- Intenta reproducir el bug en la última versión del código

#### Cómo reportar

1. Usa un título descriptivo y claro
2. Describe los pasos exactos para reproducir el problema
3. Proporciona ejemplos específicos
4. Describe el comportamiento observado vs esperado
5. Incluye capturas de pantalla o logs si es relevante
6. Incluye tu versión de Node.js, pnpm y SO

### Sugerir Mejoras

Si tienes ideas para mejorar Chat AZAC:

1. Abre un Issue con el label `enhancement`
2. Describe la mejora y por qué sería útil
3. Espera feedback de los maintainers

### Empezar con Desarrollo

#### 1. Fork y Clonar

```bash
# Hacer fork en GitHub y clonar
git clone https://github.com/TU_USERNAME/project-chat-azac.git
cd project-chat-azac/backend
```

#### 2. Crear una Rama

```bash
# Asegúrate de estar en main
git checkout main

# Crea una rama con nombre descriptivo
git checkout -b feature/nombre-del-feature
# o para bugfixes
git checkout -b bugfix/nombre-del-bug
```

#### 3. Hacer Cambios

- Sigue las convenciones de código del proyecto
- Escribe código limpio y legible
- Añade comentarios donde sea necesario
- Realiza commits pequeños y descriptivos

#### 4. Testear

```bash
# Tests unitarios
pnpm run test

# Coverage
pnpm run test:cov

# Linter
pnpm run lint

# Formatear
pnpm run format
```

#### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-del-feature
```

En GitHub:

1. Ve a tu fork
2. Click en "Compare & pull request"
3. Describe tus cambios:
   - **Qué** cambiaste
   - **Por qué** lo cambiaste
   - **Cómo** lo testeaste
4. Reference issues relacionados (e.g., `Fixes #123`)

### Convenciones de Código

#### Commits (Conventional Commits)

```
<type>(<scope>): <subject>
```

**Tipos:**

- `feat` - Nueva feature
- `fix` - Corrección de bug
- `docs` - Cambios en documentación
- `style` - Cambios que no afectan el código
- `refactor` - Refactorizar sin cambiar funcionalidad
- `perf` - Mejoras de performance
- `test` - Añadir o actualizar tests
- `chore` - Cambios en build, deps, etc

**Ejemplos:**

```bash
git commit -m "feat(users): add password reset endpoint"
git commit -m "fix(auth): validate jwt token expiration"
git commit -m "docs: update README with setup instructions"
```

#### Estructura de Carpetas

```
feature/
├── [feature-name].controller.ts    # HTTP endpoints
├── [feature-name].module.ts        # Módulo NestJS
├── [feature-name].service.ts       # Lógica de negocio
├── dtos/
│   ├── create-[feature].dto.ts
│   └── update-[feature].dto.ts
└── [feature-name].spec.ts          # Tests
```

#### Nombres

- **Archivos**: `kebab-case.ts` (e.g., `user.controller.ts`)
- **Clases**: `PascalCase` (e.g., `UserController`)
- **Variables/Funciones**: `camelCase` (e.g., `getUserById()`)
- **Constantes**: `UPPER_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`)

#### TypeScript

Siempre usa tipos explícitos:

```typescript
// ✅ Bueno
function getUserById(id: string): Promise<User> {
  // ...
}

// ❌ Evitar
function getUserById(id) {
  // ...
}
```

#### Imports

Agrupar en orden:

1. Node modules
2. Módulos del proyecto
3. Tipos e interfaces

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import type { User } from '@/domain/entities/user.entity';
```

### Documentación

Si añades una nueva feature:

1. **Actualiza este README.md** si es necesario
2. **Documenta funciones públicas** con JSDoc:

```typescript
/**
 * Obtiene un usuario por su ID
 * @param id - El ID del usuario
 * @returns El usuario encontrado o null
 * @throws NotFoundException si el usuario no existe
 */
async getUserById(id: string): Promise<User | null> {
  // ...
}
```

3. **Incluye ejemplos** en la documentación

### Checklist antes de Submit PR

- [ ] Mi código sigue las convenciones del proyecto
- [ ] He ejecutado `pnpm run lint` y `pnpm run format`
- [ ] He añadido tests para mis cambios
- [ ] Los tests pasan: `pnpm run test`
- [ ] He actualizado la documentación si es necesario
- [ ] Mis commits tienen mensajes descriptivos
- [ ] Mi rama está actualizada con main
- [ ] No he incluido cambios no relacionados

### Proceso de Review

1. Mínimo un maintainer revieweará tu PR
2. Pueden pedirse cambios
3. Una vez aprobado, tu PR será mergeado
4. Tu rama será eliminada después del merge

---

## 🔗 Links Útiles

| Recurso           | URL                            |
| ----------------- | ------------------------------ |
| **Local API**     | http://localhost:3100          |
| **Prisma Studio** | http://localhost:5555          |
| **NestJS Docs**   | https://docs.nestjs.com        |
| **Prisma Docs**   | https://www.prisma.io/docs     |
| **TypeScript**    | https://www.typescriptlang.org |

---

## 📄 Licencia

Este proyecto está licenciado bajo UNLICENSED.

---

## 📧 Contacto

Para preguntas o soporte, abre un Issue en el repositorio.

**¡Gracias por usar Chat AZAC! 🚀**

---

## 📚 Recursos Útiles

- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs)
- [Socket.io Documentation](https://socket.io/docs)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/AmazingFeature`
3. Commit tus cambios: `git commit -m 'Add AmazingFeature'`
4. Push a la rama: `git push origin feature/AmazingFeature`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia **UNLICENSED**. Consulta el archivo LICENSE para más detalles.

---

## 📧 Contacto & Soporte

Para preguntas o soporte, abre un issue en el repositorio o contacta al equipo de desarrollo.

---

<div align="center">

**Hecho con ❤️ por el equipo de Chat AZAC**

_Last updated: Jun 02, 2026_

</div>
