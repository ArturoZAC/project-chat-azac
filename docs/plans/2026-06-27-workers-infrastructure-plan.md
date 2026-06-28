# Plan: Workers Infrastructure — Background Email Processing

> **Branch:** `infrastructure/workers`
> **Base:** `main` (actualizado con channels + admin + DM 1-to-1)
> **Objetivo:** Mover el envío de emails de auth a background sin Redis ni infraestructura adicional, usando el patrón Fire & Forget (async sin `await`).

---

## 1. Análisis: Workers, Consumers y Locks en el Chat

### Workers (SÍ corresponde)

| Tarea | Hoy | Con Worker | Impacto |
|-------|:---:|:----------:|:-------:|
| Enviar email de verificación al registrarse | 500ms síncrono | 5ms → background | 🚀 El usuario registra al instante |
| Enviar email de reset password | 500ms síncrono | 5ms → background | 🚀 El usuario recibe respuesta al toque |
| Reenviar email de verificación | 500ms síncrono | 5ms → background | 🚀 |
| Push notifications (futuro) | No existe | Pendiente | Cuando se implemente |
| Procesar avatar/imagen (futuro) | No existe | Pendiente | Cuando se implemente |

**¿Por qué Workers sí?** Porque son tareas **lentas** (email SMTP: 200-500ms) que el usuario **no necesita esperar**. El worker las procesa en background mientras el usuario ya recibió su response HTTP.

### Consumers (NO corresponde aún)

| Evento | Quién lo emite | Quién reacciona |
|--------|:-------------:|:---------------:|
| `message.sent` | WebSocket Gateway | WebSocket Gateway (mismo proceso) |
| `user.online/offline` | WebSocket Gateway | WebSocket Gateway (mismo proceso) |
| `conversation.message.sent` | WebSocket Gateway | WebSocket Gateway (mismo proceso) |

**¿Por qué Consumers NO?** Porque todos los eventos que existen hoy son **manejados en el mismo proceso** por el WebSocket Gateway. No hay múltiples servicios que necesiten reaccionar al mismo evento de forma desacoplada.

**¿Cuándo podrían llegar?** Cuando haya servicios externos (push notifications, indexación, analytics) que necesiten reaccionar a eventos del chat sin estar acoplados al Gateway.

### Locks (NO corresponde)

| Operación | ¿Race condition? | ¿Lock necesario? |
|-----------|:----------------:|:----------------:|
| Enviar mensaje a canal | ❌ No (append-only) | ❌ No |
| Crear DM conversation | ❌ No (unique constraint) | ❌ No |
| Registrar usuario | ❌ No (unique email) | ❌ No |
| Unirse a canal | ❌ No (unique member) | ❌ No |

**¿Por qué Locks NO?** El chat es una app **append-only**: los usuarios crean mensajes, no compiten por recursos escasos (stock, saldo, asientos). Las restricciones de unicidad de PostgreSQL son suficientes.

---

## 2. Stack a utilizar

| Herramienta | Propósito |
|-------------|-----------|
| **Node.js Event Loop** | Worker en background sin Redis |
| **NestJS MailService** | Ya existente, solo quitamos el `await` |

No se instala nada nuevo. No se necesita Redis, RabbitMQ, BullMQ ni Docker.

### Opciones descartadas (por ahora)

| Opción | Por qué se descarta |
|--------|:-------------------:|
| **BullMQ + Redis** | Requiere Redis como servicio aparte. Para el MVP es overkill. |
| **RabbitMQ / Kafka** | Overkill total para el proyecto actual. |
| **NestJS Scheduler + DB** | Buena opción, pero innecesaria hasta que veamos pérdida de emails. |
| **PG Boss** | Dependencia externa. Se evalúa si el Fire & Forget no es suficiente. |

---

## 3. Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                      USE CASE                             │
│  register.usecase.ts                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │  const user = await this.userRepo.create(dto);     │  │
│  │                                                    │  │
│  │  // ✅ Sin await — corre en background             │  │
│  │  this.mailService.sendVerificationEmail(            │  │
│  │    user.email, user.username, token                 │  │
│  │  ).catch(err => this.logger.error('Email falló'));  │  │
│  │                                                    │  │
│  │  return user;  ← 5ms total 🚀                      │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │
                       │ (User A recibe response al toque)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    NODE.JS EVENT LOOP                     │
│                                                           │
│  El email se procesa en background MIENTRAS:              │
│  - User B puede hacer requests                           │
│  - User C puede hacer requests                           │
│  - El servidor sigue funcionando normal                  │
│                                                           │
│  ─── 200-500ms después ───                               │
│  El SMTP responde y el email se envía                     │
└──────────────────────────────────────────────────────────┘
```

### Flujo de un registro con Fire & Forget

```
POST /api/auth/register
         │
         ▼
UseCase: register()
├── Validar datos (5ms)
├── Crear user en DB (5ms)
├── Crear email_verification (3ms)
├── Iniciar sendEmail sin await (0ms)
└── Responder 201 (0ms)
                        Tiempo total: ~13ms 🚀
                                   │
                     ── después ───
                                   │
                                   ▼
Background:
├── MailService.sendVerificationEmail() (500ms)
├── Si falla → .catch() lo registra (no afecta al usuario)
└── Si termina → OK, email enviado
```

### ¿Qué cambia vs hoy?

```
HOY (con await):
POST /register → crear user → await email (500ms) → responder (505ms total) 😴

CON FIRE & FORGET (sin await):
POST /register → crear user → iniciar email → responder (13ms total) 🚀
                                   └── email termina solo 500ms después
```

---

## 4. Implementación

### Única modificación: sacar el `await` en 3 use cases

#### `register.usecase.ts` — Antes:
```typescript
async execute(dto: RegisterDto): Promise<UserEntity> {
  // ... validaciones ...
  const user = await this.userRepo.create({ ...dto, passwordHash });
  
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await this.emailVerificationRepo.create({ token, expiresAt, userId: user.id });

  // ❌ User A espera 500ms
  await this.mailService.sendVerificationEmail(user.email, user.username, token);

  return user;
}
```

#### `register.usecase.ts` — Después:
```typescript
async execute(dto: RegisterDto): Promise<UserEntity> {
  // ... validaciones ...
  const user = await this.userRepo.create({ ...dto, passwordHash });
  
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await this.emailVerificationRepo.create({ token, expiresAt, userId: user.id });

  // ✅ Fire & Forget: User A responde al instante
  this.mailService.sendVerificationEmail(user.email, user.username, token)
    .catch(err => console.error('Error enviando email:', err));

  return user;
}
```

#### `forgot-password.usecase.ts` — Antes:
```typescript
await this.mailService.sendResetPasswordEmail(user.email, user.username, token);
return { message: 'Email enviado' };
```

#### `forgot-password.usecase.ts` — Después:
```typescript
this.mailService.sendResetPasswordEmail(user.email, user.username, token)
  .catch(err => this.logger.error('Error enviando reset email:', err));
return { message: 'Email enviado' };
```

#### `resend-verification.usecase.ts` — Antes:
```typescript
await this.mailService.sendVerificationEmail(user.email, user.username, token);
return { message: 'Email reenviado' };
```

#### `resend-verification.usecase.ts` — Después:
```typescript
this.mailService.sendVerificationEmail(user.email, user.username, token)
  .catch(err => this.logger.error('Error reenviando verificación:', err));
return { message: 'Email reenviado' };
```

---

## 5. Manejo de errores

```typescript
this.mailService.sendVerificationEmail(user.email, user.username, token)
  .catch(err => {
    // 1. Log del error
    this.logger.error(`Email falló para ${user.email}:`, err);
    
    // 2. Opcional: guardar en DB para reintentar después
    // await this.jobRepo.create({ type: 'email', payload: {...} });
  });
```

| Escenario | Qué pasa |
|-----------|----------|
| Email falla (SMTP caído) | `.catch()` lo registra en logs. El usuario ya está creado ✅ |
| Server crashea justo cuando se envía el email | El email se pierde (aceptable para MVP) |
| Email se envía correctamente | Todo bien ✅ |

**¿Qué mejora después?** Si vemos que se pierden emails, implementamos una tabla `Job` en PostgreSQL para persistir los trabajos pendientes.

---

## 6. Resumen de archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/application/use-cases/auth/register.usecase.ts` | Sacar `await` + agregar `.catch()` |
| `src/application/use-cases/auth/forgot-password.usecase.ts` | Sacar `await` + agregar `.catch()` |
| `src/application/use-cases/auth/resend-verification.usecase.ts` | Sacar `await` + agregar `.catch()` |

**No se crean archivos nuevos. No se instalan dependencias. No se necesita Redis.**

---

## 7. Lo que NO se hace

| No hacer | Por qué |
|----------|---------|
| Instalar BullMQ + Redis | No tenemos Redis, no lo necesitamos para MVP |
| Crear módulo QueueModule | No hay cola que configurar |
| Docker Compose para Redis | No usamos Redis |
| Consumers de eventos | WebSocket Gateway maneja todo en proceso |
| Locks | No hay race conditions en chat append-only |
| Notificaciones push (FCM) | Fuera de scope |
| Tabla `Job` en PostgreSQL | Se agrega si empezamos a perder emails |

---

## 8. Tiempo estimado

| Archivo | Estimado |
|:-------:|:--------:|
| `register.usecase.ts` | 5 min |
| `forgot-password.usecase.ts` | 2 min |
| `resend-verification.usecase.ts` | 2 min |
| Testing manual | 10 min |
| **Total** | **~20 min** |

---

## 9. Plan futuro (cuando el proyecto crezca)

```
MVP (ahora):
Fire & Forget → async sin await + .catch()

Cuando se pierdan emails:
Tabla Job en PostgreSQL → persistencia + reintentos

Cuando haya múltiples servidores:
BullMQ + Redis → workers escalables + dashboard

Cuando haya muchos eventos:
Consumers → desacoplar servicios (notifications, analytics)
```

---

## 10. Estado final de las ramas

```
main (actualizado ✅)
├── channels
├── admin
├── dm-1to1
└── infrastructure/workers ← NUEVA (desde main actualizado)
    └── docs/plans/2026-06-27-workers-infrastructure-plan.md
```
