<div align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</div>

# 💬 Chat AZAC - Backend

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/License-UNLICENSED-red)
![Version](https://img.shields.io/badge/Version-0.0.1-blue)

Backend API escalable y moderno para una aplicación de chat colaborativa en tiempo real.

</div>

---

## 📋 Descripción

**Chat AZAC** es el backend de una plataforma de mensajería colaborativa construida con **NestJS** y **TypeScript**. Proporciona una API REST robusta con soporte para:

- 👥 Gestión completa de usuarios
- 💬 Sistema de canales públicos y privados
- 📨 Mensajería en tiempo real (WebSockets)
- 🔐 Autenticación basada en JWT
- 📧 Sistema de notificaciones por correo electrónico
- 📖 Seguimiento de lectura de mensajes
- 🔑 Control de acceso basado en roles

El proyecto sigue principios de **Clean Architecture** y **SOLID**, asegurando código mantenible y escalable.

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
- ✅ Perfil de usuario (avatar, nombre, etc.)
- ✅ Sistema de roles (USER, ADMIN)
- ✅ Estado online/offline

### 💬 Sistema de Canales

- ✅ Crear canales públicos y privados
- ✅ Gestionar miembros del canal
- ✅ Asignar roles dentro del canal (OWNER, MEMBER, GUEST)
- ✅ Seguimiento de última lectura

### 📨 Mensajería

- ✅ Enviar mensajes en canales
- ✅ Editar y eliminar mensajes
- ✅ Respuestas/Threads de mensajes
- ✅ Marcado de mensajes como leídos
- ✅ Timestamps automáticos

### 🔐 Seguridad

- ✅ Autenticación con JWT
- ✅ Hash de contraseñas con bcryptjs
- ✅ Validación de entrada con Zod
- ✅ Tokens de verificación de email
- ✅ Tokens de reset de contraseña con expiración

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
├── main.ts                          # Punto de entrada de la aplicación
├── app.module.ts                    # Módulo raíz
│
├── config/
│   └── envs.ts                      # Validación de variables de entorno (Zod)
│
├── application/
│   └── use-cases/
│       └── users/
│           ├── get-users.usecase.ts        # Obtener lista de usuarios
│           ├── get-user.usecase.ts         # Obtener un usuario
│           ├── update-user.usecase.ts      # Actualizar usuario
│           └── delete-user.usecase.ts      # Eliminar usuario
│
├── domain/
│   ├── entities/
│   │   └── user.entity.ts           # Entidad User (lógica de negocio)
│   └── repositories/
│       └── user.repository.ts       # Interfaz de repositorio de User
│
├── infrastructure/
│   ├── logger/
│   │   ├── logger.module.ts         # Módulo de logging
│   │   └── winston.logger.ts        # Configuración de Winston
│   ├── mail/
│   │   ├── mail.module.ts           # Módulo de email
│   │   ├── mail.service.ts          # Servicio de email (Nodemailer)
│   │   └── templates/
│   │       ├── verify-email.hbs     # Template: verificación de email
│   │       └── reset-password.hbs   # Template: reset de contraseña
│   └── prisma/
│       ├── prisma.module.ts         # Módulo de Prisma
│       ├── prisma.service.ts        # Servicio de conexión a BD
│       ├── mappers/
│       │   └── user.mapper.ts       # Transformar DTO ↔ Entidad ↔ Prisma
│       └── repositories/
│           └── user.prisma.repository.ts   # Implementación de User Repository
│
└── presentation/
    ├── http/
    │   ├── users/
    │   │   ├── users.controller.ts  # Endpoints REST de usuarios
    │   │   ├── users.module.ts      # Módulo de usuarios
    │   │   └── dtos/
    │   │       ├── get-users.dto.ts    # DTO para query de usuarios
    │   │       └── update-user.dto.ts  # DTO para actualizar usuario
    │   │
    │   └── [otros-modulos]
    │
    ├── filters/
    │   └── http-exception.filter.ts # Manejo centralizado de excepciones HTTP
    │
    └── interceptors/
        ├── logging.interceptor.ts   # Interceptor de logging
        └── response.interceptor.ts  # Interceptor de formateo de respuestas
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

### Usuarios

| Método     | Endpoint         | Descripción                          |
| ---------- | ---------------- | ------------------------------------ |
| **GET**    | `/api/users`     | Obtener lista de usuarios (paginado) |
| **GET**    | `/api/users/:id` | Obtener usuario por ID               |
| **PATCH**  | `/api/users/:id` | Actualizar usuario                   |
| **DELETE** | `/api/users/:id` | Eliminar usuario                     |

_Los endpoints adicionales (Auth, Canales, Mensajes) están pendientes de implementación._

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

_Last updated: May 27, 2026_

</div>
