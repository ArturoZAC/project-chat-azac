# Plan: Workers Infrastructure — Background Job Processing

> **Branch:** `infrastructure/workers`
> **Base:** `main` (actualizado con channels + admin + DM 1-to-1)
> **Objetivo:** Implementar BullMQ + Redis para procesar tareas pesadas en background, empezando por emails.

---

## 1. Análisis: Workers, Consumers y Locks en el Chat

### Workers (SÍ corresponde)

| Tarea | Hoy | Con Worker | Impacto |
|-------|:---:|:----------:|:-------:|
| Enviar email de verificación al registrarse | 500ms síncrono | 5ms → worker | 🚀 El usuario registra al instante |
| Enviar email de reset password | 500ms síncrono | 5ms → worker | 🚀 El usuario recibe respuesta al toque |
| Reenviar email de verificación | 500ms síncrono | 5ms → worker | 🚀 |
| Push notifications (futuro) | No existe | Worker encolable | Preparado para cuando se implemente |
| Procesar avatar/imagen (futuro) | No existe | Worker encolable | Preparado |

**¿Por qué Workers sí?** Porque son tareas **lentas** (email SMTP: 200-500ms) que el usuario **no necesita esperar**. El worker las procesa en background mientras el usuario ya recibió su response HTTP.

### Consumers (NO corresponde aún)

| Evento | Quién lo emite | Quién reacciona |
|--------|:-------------:|:---------------:|
| `message.sent` | WebSocket Gateway | WebSocket Gateway (mismo proceso) |
| `user.online/offline` | WebSocket Gateway | WebSocket Gateway (mismo proceso) |
| `conversation.message.sent` | WebSocket Gateway | WebSocket Gateway (mismo proceso) |

**¿Por qué Consumers NO?** Porque todos los eventos que existen hoy son **manejados en el mismo proceso** por el WebSocket Gateway. No hay múltiples servicios que necesiten reaccionar al mismo evento de forma desacoplada. Agregar una cola de eventos (BullMQ/Kafka) sería **sobreingeniería** para el tamaño actual del proyecto.

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

| Herramienta | Versión | Propósito |
|-------------|:-------:|-----------|
| **BullMQ** | última | Cola de trabajos con Redis |
| **ioredis** | última | Cliente Redis para NestJS |
| **@nestjs/bull** | última | Integración BullMQ + NestJS |
| **Docker** | — | Redis en contenedor (dev) |

### ¿Por qué BullMQ y no otra?

| Opción | Ventaja | Desventaja |
|--------|:-------:|:----------:|
| **BullMQ** ✅ | Persistencia, reintentos, programación, progreso, dashboard | Requiere Redis |
| NestJS EventEmitter | No requiere Redis | Sin persistencia, sin reintentos, sin dashboard |
| RabbitMQ / Kafka | Muy potentes | Overkill para el proyecto |
| SetTimeout / setInterval | Simple | No sobrevive a crashes, no escalable |

BullMQ es el estándar de la industria para NestJS + background jobs.

---

## 3. Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                      CONTROLLER                          │
│  POST /auth/register                                     │
│  POST /auth/forgot-password                              │
│  POST /auth/resend-verification                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                     USE CASE                              │
│  register.usecase.ts                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │  await this.queue.add('send-verification-email',   │  │
│  │    { userId, email, token })                       │  │
│  │  return { user }  ← 5ms total 🚀                  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    BULLMQ QUEUE (Redis)                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Cola: "emails"                                    │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐                         │  │
│  │  │job 1│ │job 2│ │job 3│  ...                    │  │
│  │  └─────┘ └─────┘ └─────┘                         │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  WORKER (BullMQ Processor)                │
│  @Processor('emails')                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │  @Process('send-verification-email')               │  │
│  │  async handle(job: Job) {                          │  │
│  │    await this.mailService.sendVerificationEmail(   │  │
│  │      job.data.email, job.data.token                │  │
│  │    );  // 500ms en background                      │  │
│  │  }                                                 │  │
│  │                                                    │  │
│  │  @Process('send-reset-password-email')             │  │
│  │  async handle(job: Job) { ... }                    │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Flujo de un registro con Worker

```
POST /api/auth/register
         │
         ▼
UseCase: register()
├── Validar datos
├── Crear user en DB (5ms)
├── Crear email_verification (3ms)
├── Encolar trabajo "send-verification-email" (1ms) ← NUEVO
└── Responder 201 (0ms)
                        Tiempo total: ~9ms 🚀
                                  │
                    ── 100ms después ──
                                  │
                                  ▼
Worker "emails"
├── Tomar trabajo de la cola
├── Llamar MailService.sendVerificationEmail() (500ms)
├── Si falla → reintentar (BullMQ: 3 veces automático)
└── Si sigue fallando → pasar a "failed" (no bloquea al usuario)
```

### ¿Qué cambia vs hoy?

```
HOY (síncrono):
POST /register → crear user → enviar email (500ms) → responder (505ms total) 😴

CON WORKER:
POST /register → crear user → encolar → responder (10ms total) 🚀
                                  └── worker → enviar email (500ms en background)
```

---

## 4. Implementación

### FASE 0: Redis + BullMQ setup

**package.json** (nuevas dependencias):
```json
{
  "@nestjs/bull": "^10.x",
  "bull": "^10.x",
  "ioredis": "^5.x"
}
```

**Docker Compose** para Redis (dev):
```yaml
# redis-compose.yml en backend/
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

**`.env`** (nuevas variables):
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

**`envs.ts`** (validación Zod):
```typescript
REDIS_HOST: z.string().default('localhost'),
REDIS_PORT: z.coerce.number().default(6379),
```

---

### FASE 1: Módulo BullMQ en NestJS

**Archivos a crear:**

```
src/infrastructure/queue/
├── queue.module.ts          ← @Global() exportando BullModule
├── producers/
│   └── email.producer.ts    ← Inyectable para encolar trabajos de email
└── consumers/
    └── email.consumer.ts    ← Worker que procesa los emails
```

**`queue.module.ts`** — Configuración global de BullMQ:
```typescript
@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: envs.REDIS_HOST,
        port: envs.REDIS_PORT,
      },
    }),
    BullModule.registerQueue({
      name: 'emails',
    }),
  ],
  providers: [EmailProducer, EmailConsumer],
  exports: [EmailProducer],
})
export class QueueModule {}
```

**`email.producer.ts`** — Encola trabajos:
```typescript
@Injectable()
export class EmailProducer {
  constructor(@InjectQueue('emails') private emailsQueue: Queue) {}

  async sendVerificationEmail(userId: string, email: string, token: string) {
    await this.emailsQueue.add('send-verification-email', {
      userId, email, token,
    }, {
      attempts: 3,           // Reintentar 3 veces
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async sendResetPasswordEmail(userId: string, email: string, token: string) {
    await this.emailsQueue.add('send-reset-password-email', {
      userId, email, token,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }
}
```

**`email.consumer.ts`** — Worker que envía los emails:
```typescript
@Processor('emails')
export class EmailConsumer {
  constructor(private readonly mailService: MailService) {}

  @Process('send-verification-email')
  async handleVerification(job: Job<{ userId: string; email: string; token: string }>) {
    await this.mailService.sendVerificationEmail(job.data.email, job.data.token);
    // ✅ Si falla, BullMQ reintenta automáticamente hasta 3 veces
    // ✅ Si sigue fallando, pasa a "failed" (visible en dashboard)
  }

  @Process('send-reset-password-email')
  async handleResetPassword(job: Job<{ userId: string; email: string; token: string }>) {
    await this.mailService.sendResetPasswordEmail(job.data.email, job.data.token);
  }
}
```

---

### FASE 2: Modificar Use Cases de Auth

**`register.usecase.ts`** — Antes:
```typescript
async execute(dto) {
  const user = await this.userRepo.create(dto);
  await this.mailService.sendVerificationEmail(user.email, token);
  // ❌ Usuario espera 500ms
  return { user };
}
```

**`register.usecase.ts`** — Después:
```typescript
async execute(dto) {
  const user = await this.userRepo.create(dto);
  await this.emailProducer.sendVerificationEmail(user.id, user.email, token);
  // ✅ Usuario responde en 5ms, worker envía email después
  return { user };
}
```

**Mismos cambios en:**
- `forgot-password.usecase.ts`
- `resend-verification.usecase.ts`

---

### FASE 3: Bull Board (Dashboard) — Opcional pero recomendado

Bull Board es un dashboard web para ver colas, jobs, fallos, reintentos:

```bash
pnpm add @bull-board/nestjs @bull-board/ui
```

```typescript
// main.ts o un módulo aparte
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';

async function bootstrap() {
  // ... resto de la config
  
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  
  createBullBoard({
    queues: [...],
    serverAdapter,
  });
  
  app.use('/admin/queues', serverAdapter.getRouter());
}
```

---

### FASE 4: Scripts de Docker + package.json

**`docker-compose.yml`** en `backend/`:
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

**`package.json`** (nuevos scripts):
```json
{
  "scripts": {
    "docker:redis": "docker compose up -d redis",
    "docker:redis:stop": "docker compose down"
  }
}
```

---

## 5. Reintentos y manejo de errores

BullMQ reintenta automáticamente según la config:

```typescript
await this.emailsQueue.add('send-verification-email', data, {
  attempts: 3,
  backoff: {
    type: 'exponential',  // 2s → 4s → 8s entre reintentos
    delay: 2000,
  },
});
```

| Intento | Tiempo de espera |
|:-------:|:----------------:|
| 1 | Inmediato |
| 2 | 2 segundos después |
| 3 | 4 segundos después |
| Fallo | Pasa a estado `failed` (visible en Bull Board) |

Los workers **no afectan al usuario**. Si el email falla después de 3 intentos:
- El usuario ya tiene su cuenta creada ✅
- El error queda registrado en la cola (failed jobs)
- Se puede reintentar manualmente desde Bull Board

---

## 6. Workers adicionales (futuro)

Una vez montada la infraestructura, agregar workers es trivial:

```typescript
// Notificaciones push (FCM/APNs)
@Processor('notifications')
export class PushNotificationWorker {
  @Process('send-push')
  async handle(job: Job) {
    await this.fcmService.send(job.data.userId, job.data.payload);
  }
}

// Procesamiento de imágenes
@Processor('images')
export class ImageWorker {
  @Process('resize-avatar')
  async handle(job: Job) {
    await this.sharpService.resize(job.data.path, 200, 200);
  }
}
```

---

## 7. Resumen de archivos a crear/modificar

### Crear
| Archivo | Propósito |
|---------|-----------|
| `backend/docker-compose.yml` | Redis container |
| `backend/src/infrastructure/queue/queue.module.ts` | Módulo BullMQ global |
| `backend/src/infrastructure/queue/producers/email.producer.ts` | Encola trabajos de email |
| `backend/src/infrastructure/queue/consumers/email.consumer.ts` | Worker que envía emails |

### Modificar
| Archivo | Cambio |
|---------|--------|
| `backend/package.json` | + `@nestjs/bull`, `bull`, `ioredis` |
| `backend/src/config/envs.ts` | + `REDIS_HOST`, `REDIS_PORT` |
| `backend/src/app.module.ts` | + `QueueModule` en imports |
| `backend/src/application/use-cases/auth/register.usecase.ts` | Usar `EmailProducer` en vez de `MailService` directo |
| `backend/src/application/use-cases/auth/forgot-password.usecase.ts` | Ídem |
| `backend/src/application/use-cases/auth/resend-verification.usecase.ts` | Ídem |

---

## 8. Lo que NO se hace

| No hacer | Por qué |
|----------|---------|
| Consumers de eventos (pub/sub) | No hay necesidad; WebSocket Gateway maneja todo en proceso |
| Locks | No hay race conditions en un chat append-only |
| Notificaciones push (FCM) | Fuera de scope; se agrega cuando haya mobile app |
| Cache layer | No hay necesidad actual; no hay consultas pesadas repetitivas |
| Rate limiting | No especificado; se agrega cuando haya problemas de abuso |
| Separar workers en proceso aparte | BullMQ ya corre en el mismo proceso NestJS; separar es premature |
| Bull Board | Opcional, no bloqueante |

---

## 9. Tiempo estimado

| Fase | Estimado |
|:----:|:--------:|
| FASE 0: Redis + docker + envs | 15 min |
| FASE 1: QueueModule + Producer + Consumer | 30 min |
| FASE 2: Modificar use cases de Auth | 20 min |
| FASE 3: Bull Board (opcional) | 15 min |
| Testing manual | 20 min |
| **Total** | **~1.5 - 2 horas** |

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

---

## Notas adicionales

- Redis debe estar corriendo para que la app funcione (igual que PostgreSQL)
- Si Redis no está disponible, BullMQ lanza error al arrancar → la app no inicia
- En producción se usaría Redis en la nube (Upstash, Redis Enterprise, ElastiCache)
- Para desarrollo local: `pnpm run docker:redis` levanta Redis en segundo plano
