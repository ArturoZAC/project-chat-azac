# ⚡ Guía Rápida - Chat AZAC Backend

Comandos y referencias rápidas para trabajar con Chat AZAC.

---

## 🚀 Primeros Pasos (5 minutos)

```bash
# 1. Instalar dependencias
pnpm install

# 2. Copiar archivo de variables de entorno
cp .env.example .env

# 3. Iniciar servidor en modo desarrollo
pnpm run start:dev

# 4. Servidor disponible en: http://localhost:3100
```

---

## 📋 Comandos Principales

### 🔧 Desarrollo

```bash
pnpm run start       # Iniciar servidor
pnpm run start:dev   # Modo watch (recarga automática)
pnpm run start:debug # Con debugger
pnpm run build       # Compilar TypeScript
pnpm run start:prod  # Producción
```

### 🧹 Código

```bash
pnpm run lint        # ESLint con fix automático
pnpm run format      # Prettier
```

### 🧪 Testing

```bash
pnpm run test        # Tests unitarios
pnpm run test:watch  # Tests con watch
pnpm run test:cov    # Coverage
pnpm run test:e2e    # End-to-end
```

### 🗄️ Base de Datos

```bash
pnpm run seed                               # Poblar datos de prueba
pnpm run prisma:studio                      # Prisma Studio (UI)
pnpm run prisma:migrate:dev --name cambio   # Nueva migración
pnpm run prisma:migrate:status              # Ver estado migraciones
pnpm run prisma:migrate:reset               # Reset BD (solo dev)
```

---

## 🔑 Variables de Entorno Clave

```bash
DATABASE_URL=postgresql://usuario:pass@localhost:5432/chat_azac
JWT_SECRET=tu_secreto_muy_seguro
PORT=3100
```

---

## 📚 Estructura Clave

```
src/
├── presentation/  → HTTP Controllers, DTOs
├── application/   → Use Cases (lógica)
├── domain/        → Entities, Interfaces
└── infrastructure/ → BD, Logger, Email
```

---

## 🔗 Links Útiles

| Recurso             | URL                                 |
| ------------------- | ----------------------------------- |
| **Local API**       | http://localhost:3100               |
| **Prisma Studio**   | http://localhost:5555               |
| **NestJS Docs**     | https://docs.nestjs.com             |
| **Prisma Docs**     | https://www.prisma.io/docs          |
| **TypeScript Docs** | https://www.typescriptlang.org/docs |

---

## 🆘 Troubleshooting Rápido

### Error: `connect ECONNREFUSED`

```bash
# Verifica PostgreSQL está corriendo
sudo service postgresql status

# Crea la BD si no existe
createdb chat_azac

# Aplica migraciones
pnpm run prisma:migrate:deploy
```

### Error: `Missing environment variable`

```bash
# Copia el template
cp .env.example .env

# Edita con tus valores
nano .env
```

### Puerto ya en uso

```bash
# Cambia en .env
PORT=3101

# O mata el proceso
lsof -ti :3100 | xargs kill -9
```

### Migraciones desincronizadas

```bash
# Reset completo (SOLO desarrollo)
pnpm run prisma:migrate:reset

# O fuerza la migración actual
pnpm run prisma:migrate:deploy
```

---

## 💡 Tips & Tricks

### Debug rápido

```bash
# Terminal 1: Ejecutar con debugger
pnpm run start:debug

# Terminal 2: Abrir chrome://inspect
```

### Ver logs en tiempo real

```bash
tail -f logs/app.log
```

### Resetear todo (nuclear option - SOLO en desarrollo)

```bash
# Elimina BD, migraciones y reinstala
pnpm run prisma:migrate:reset
pnpm run seed
```

### Generar nueva migración

```bash
# Después de cambiar schema.prisma
pnpm run prisma:migrate:dev --name descripcion_cambio
```

### Verificar tipos de TypeScript

```bash
# Sin compilar
pnpm exec tsc --noEmit
```

---

## 🔄 Flujo de Trabajo Típico

### 1. Nueva Feature

```bash
# Actualizar schema.prisma
nano prisma/schema.prisma

# Generar migración
pnpm run prisma:migrate:dev --name add_field

# Crear entidad y repository
# src/domain/entities/...
# src/domain/repositories/...

# Implementar repository
# src/infrastructure/prisma/repositories/...

# Crear use case
# src/application/use-cases/...

# Crear controller
# src/presentation/http/...

# Testear
pnpm run test
```

### 2. Bugfix

```bash
# Crear rama
git checkout -b bugfix/descripcion

# Hacer cambios
# Testear
pnpm run test

# Commit
git commit -m "fix: descripcion del bug"

# Push
git push origin bugfix/descripcion

# PR en GitHub
```

---

## 📊 Estructura de Tipos (TypeScript)

```typescript
// Entidad de dominio - Business Logic
class User {
  id: string;
  email: string;
  // Métodos de negocio
  isAdmin(): boolean {}
}

// DTO - Validación de entrada
class UpdateUserDto {
  @IsEmail()
  email?: string;
}

// Response - Salida formateada
interface UserResponse {
  id: string;
  email: string;
  name: string;
}
```

---

## 🔐 Autenticación Quick Test

```bash
# 1. Login
curl -X POST http://localhost:3100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 2. Copiar el token de la respuesta

# 3. Usar el token en requests
curl -X GET http://localhost:3100/api/users \
  -H "Authorization: Bearer <token_aqui>"
```

---

## 📝 Archivo .env Mínimo

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chat_azac
JWT_SECRET=dev-secret-key-change-in-production
PORT=3100
NODE_ENV=development

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_contraseña_app
MAIL_FROM=noreply@chatazac.com

# URLs
APP_URL=http://localhost:3100
CLIENT_URL=http://localhost:5173
```

---

## 🎯 Checklist - Primeras Horas

- [ ] Clonar repo
- [ ] Instalar dependencias: `pnpm install`
- [ ] Copiar `.env.example` a `.env`
- [ ] Verificar PostgreSQL está corriendo
- [ ] Crear BD: `createdb chat_azac`
- [ ] Ejecutar migraciones: `pnpm run prisma:migrate:deploy`
- [ ] Iniciar servidor: `pnpm run start:dev`
- [ ] Abrir http://localhost:3100
- [ ] Leer README.md
- [ ] Leer ARCHITECTURE.md

---

## 🚀 Deploy Rápido (Producción)

```bash
# 1. Build
pnpm run build

# 2. Configurar env en producción
export DATABASE_URL=postgresql://...
export JWT_SECRET=super-secreto
export NODE_ENV=production

# 3. Ejecutar
pnpm run start:prod
```

---

## 📞 Preguntas Frecuentes

**P: ¿Cómo creo un nuevo endpoint?**
A: Controllers → DTOs → Use Cases → Repositories → Entities

**P: ¿Dónde va la lógica de negocio?**
A: En las Entities y Use Cases (Application Layer)

**P: ¿Cómo cambio la BD a MongoDB?**
A: Crea `MongoRepository` implementando `IUserRepository`

**P: ¿Hay tests?**
A: Estructura está lista, agrega tests en `*.spec.ts`

**P: ¿Cómo debugueo?**
A: `pnpm run start:debug` y abre `chrome://inspect`

---

**Última actualización:** May 27, 2026

💬 Ayuda: Lee CONTRIBUTING.md para más info
📚 Arquitectura: Lee ARCHITECTURE.md para la estructura completa
🔌 API: Lee API_DOCUMENTATION.md para endpoints
