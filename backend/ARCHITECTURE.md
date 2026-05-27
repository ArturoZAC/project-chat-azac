# 🏗️ Arquitectura del Proyecto - Chat AZAC

Documento que describe la arquitectura y patrones de diseño utilizados en el backend de Chat AZAC.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Capas de la Arquitectura](#capas-de-la-arquitectura)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Flujo de una Solicitud](#flujo-de-una-solicitud)
5. [Estructura de Carpetas](#estructura-de-carpetas)
6. [Principios SOLID](#principios-solid)

---

## 🎯 Descripción General

Chat AZAC implementa **Clean Architecture** (también conocida como Hexagonal Architecture) para garantizar:

- ✅ **Independencia de frameworks** - La lógica de negocio no depende de NestJS
- ✅ **Testabilidad** - Fácil de testear sin dependencias externas
- ✅ **Mantenibilidad** - Código organizado y coherente
- ✅ **Escalabilidad** - Fácil de agregar nuevas funcionalidades

---

## 🔢 Capas de la Arquitectura

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

### 1️⃣ **Presentation Layer** (Capa de Presentación)

**Ubicación:** `src/presentation/`

**Responsabilidades:**

- Recibir solicitudes HTTP
- Validar entrada de datos (DTOs)
- Formatear respuestas
- Manejar excepciones HTTP
- Logging de solicitudes

**Componentes:**

```
presentation/
├── http/
│   └── users/
│       ├── users.controller.ts      # Endpoints REST
│       ├── users.module.ts          # Declaración del módulo
│       └── dtos/
│           ├── get-users.dto.ts     # DTO para query
│           └── update-user.dto.ts   # DTO para body
├── filters/
│   └── http-exception.filter.ts    # Manejo de excepciones
└── interceptors/
    ├── logging.interceptor.ts       # Log de requests/responses
    └── response.interceptor.ts      # Formato de respuestas
```

**Ejemplo - Controller:**

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

  @Get()
  async getUsers(@Query() query: GetUsersDto) {
    // El controller solo orquesta
    return this.getUsersUseCase.execute(query);
  }
}
```

**Ejemplo - DTO:**

```typescript
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

---

### 2️⃣ **Application Layer** (Capa de Aplicación)

**Ubicación:** `src/application/`

**Responsabilidades:**

- Implementar casos de uso
- Orquestar operaciones
- Validación de lógica de aplicación
- Llamar a repositorios

**Componentes:**

```
application/
└── use-cases/
    └── users/
        ├── get-users.usecase.ts     # UC: Obtener lista de usuarios
        ├── get-user.usecase.ts      # UC: Obtener un usuario
        ├── update-user.usecase.ts   # UC: Actualizar usuario
        └── delete-user.usecase.ts   # UC: Eliminar usuario
```

**Ejemplo - Use Case:**

```typescript
@Injectable()
export class GetUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(query: GetUsersDto): Promise<PaginatedUsers> {
    this.logger.log('Obteniendo lista de usuarios...');

    try {
      const users = await this.userRepository.findAll(query);
      return {
        data: users,
        pagination: query.pagination,
      };
    } catch (error) {
      this.logger.error('Error al obtener usuarios', error);
      throw new InternalServerErrorException();
    }
  }
}
```

**Características:**

- Una clase = Un caso de uso
- Inyección de dependencias con NestJS
- Lógica de negocio específica de la aplicación

---

### 3️⃣ **Domain Layer** (Capa de Dominio)

**Ubicación:** `src/domain/`

**Responsabilidades:**

- Definir entidades
- Especificar interfaces de repositorios
- Reglas de negocio núcleo
- Valores constantes del negocio

**Componentes:**

```
domain/
├── entities/
│   └── user.entity.ts               # Clase User (lógica de negocio)
└── repositories/
    └── user.repository.ts           # Interfaz IUserRepository
```

**Ejemplo - Entity:**

```typescript
export class User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  isOnline: boolean;
  createdAt: Date;

  constructor(data: IUserProps) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role ?? UserRole.USER;
    // Regla de negocio: validar email
    if (!this.isValidEmail(this.email)) {
      throw new DomainError('Email inválido');
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Métodos de negocio
  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
```

**Ejemplo - Repository Interface:**

```typescript
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(query: QueryOptions): Promise<User[]>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

**Características:**

- **No depende de NestJS** - Podría usarse en otra aplicación
- **Reglas de negocio núcleo** - Validaciones, cálculos
- **Interfaces de repositorios** - Contrato para implementaciones

---

### 4️⃣ **Infrastructure Layer** (Capa de Infraestructura)

**Ubicación:** `src/infrastructure/`

**Responsabilidades:**

- Implementar interfaces de repositorios
- Gestionar base de datos (Prisma)
- Logging
- Configuración externa

**Componentes:**

```
infrastructure/
├── logger/
│   ├── logger.module.ts
│   └── winston.logger.ts
├── mail/
│   ├── mail.module.ts               # Módulo de email (Nodemailer)
│   ├── mail.service.ts              # Servicio para enviar emails
│   └── templates/
│       ├── verify-email.hbs         # Template: verificación de email
│       └── reset-password.hbs       # Template: reset de contraseña
└── prisma/
    ├── prisma.module.ts
    ├── prisma.service.ts            # Conexión a BD
    ├── mappers/
    │   └── user.mapper.ts           # Transformar Prisma ↔ Domain
    └── repositories/
        └── user.prisma.repository.ts # Implementación de IUserRepository
```

**Ejemplo - Mapper:**

```typescript
export class UserMapper {
  // Prisma User → Domain User
  static toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      passwordHash: prismaUser.passwordHash,
      role: prismaUser.role as UserRole,
      isOnline: prismaUser.isOnline,
    });
  }

  // Domain User → Prisma User
  static toPrisma(user: User): Prisma.UserCreateInput {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role,
      isOnline: user.isOnline,
    };
  }
}
```

**Ejemplo - Repository Implementation:**

```typescript
@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  async create(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: UserMapper.toPrisma(user),
    });

    return UserMapper.toDomain(prismaUser);
  }

  // ... otros métodos
}
```

**Características:**

- Implementa interfaces de Domain Layer
- Usa Mappers para transformar datos
- Manejo de base de datos centralizado

---

## 🔄 Patrones de Diseño

### 1. **Repository Pattern**

Abstrae el acceso a datos:

```typescript
// Domain
interface IUserRepository {
  findById(id: string): Promise<User>;
}

// Infrastructure - Implementación
@Injectable()
class UserPrismaRepository implements IUserRepository {
  async findById(id: string): Promise<User> {
    // Implementación con Prisma
  }
}

// Application - Uso
@Injectable()
class GetUserUseCase {
  constructor(private repo: IUserRepository) {}
}
```

**Ventaja:** Fácil cambiar de base de datos (Prisma → TypeORM, MongoDB, etc.)

---

### 2. **Dependency Injection**

NestJS inyecta dependencias automáticamente:

```typescript
@Injectable()
class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: LoggerService,
  ) {}
}
```

**Ventaja:** Loose coupling, fácil de testear

---

### 3. **Use Case Pattern**

Cada operación es un use case independiente:

```typescript
@Injectable()
class GetUserUseCase {
  async execute(id: string): Promise<User> {
    // Lógica de un caso de uso
  }
}
```

**Ventaja:** Una responsabilidad clara

---

### 4. **DTO Pattern**

Datos transferidos con validación:

```typescript
export class UpdateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
```

**Ventaja:** Validación automática, type-safety

---

### 5. **Mapper Pattern**

Transforma datos entre capas:

```typescript
UserMapper.toDomain(prismaUser); // Prisma → Domain
UserMapper.toPersistence(user); // Domain → Prisma
```

**Ventaja:** Desacoplamiento entre capas

---

## 📊 Flujo de una Solicitud

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

**Ejemplo concreto:**

```
GET /api/users/uuid-123

→ UsersController.getUser(id)
→ GetUserUseCase.execute(id)
→ UserRepository.findById(id)  [interfaz de Domain]
→ UserPrismaRepository.findById(id)  [implementación de Infrastructure]
→ this.prisma.user.findUnique({ where: { id } })
→ Mapper.toDomain(prismaUser)
→ Return User entity
→ ResponseInterceptor.intercept()
→ HTTP 200 { user: ... }
```

---

## 📁 Estructura de Carpetas

```
src/
├── main.ts                      # Bootstrap de la app
├── app.module.ts                # Módulo raíz
│
├── config/
│   └── envs.ts                  # Validación de env (Zod)
│
├── application/                 # Lógica de aplicación
│   ├── use-cases/
│   │   └── users/
│   │       ├── get-users.usecase.ts
│   │       ├── get-user.usecase.ts
│   │       ├── create-user.usecase.ts
│   │       ├── update-user.usecase.ts
│   │       └── delete-user.usecase.ts
│   └── exceptions/              # Excepciones de aplicación
│       └── user.exceptions.ts
│
├── domain/                      # Núcleo del negocio
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── channel.entity.ts
│   │   └── message.entity.ts
│   └── repositories/
│       ├── user.repository.ts
│       ├── channel.repository.ts
│       └── message.repository.ts
│
├── infrastructure/              # Implementaciones técnicas
│   ├── logger/
│   │   ├── logger.module.ts
│   │   ├── winston.logger.ts
│   │   └── logger.service.ts
│   ├── mail/
│   │   ├── mail.module.ts
│   │   ├── mail.service.ts
│   │   └── templates/
│   │       ├── verify-email.hbs
│   │       └── reset-password.hbs
│   └── prisma/
│       ├── prisma.module.ts
│       ├── prisma.service.ts
│       ├── mappers/
│       │   ├── user.mapper.ts
│       │   ├── channel.mapper.ts
│       │   └── message.mapper.ts
│       └── repositories/
│           ├── user.prisma.repository.ts
│           ├── channel.prisma.repository.ts
│           └── message.prisma.repository.ts
│
└── presentation/                # Capa HTTP
    ├── http/
    │   ├── users/
    │   │   ├── users.controller.ts
    │   │   ├── users.module.ts
    │   │   └── dtos/
    │   │       ├── get-users.dto.ts
    │   │       ├── create-user.dto.ts
    │   │       └── update-user.dto.ts
    │   ├── channels/
    │   │   └── ...
    │   └── messages/
    │       └── ...
    ├── filters/
    │   ├── http-exception.filter.ts
    │   └── validation-exception.filter.ts
    ├── interceptors/
    │   ├── logging.interceptor.ts
    │   ├── response.interceptor.ts
    │   └── error.interceptor.ts
    ├── pipes/
    │   └── validation.pipe.ts
    └── guards/
        ├── jwt-auth.guard.ts
        └── admin.guard.ts
```

---

## 🎯 Principios SOLID

### S - Single Responsibility Principle

**Cada clase tiene una única responsabilidad:**

```typescript
// ✅ Bueno - Una clase, una responsabilidad
export class GetUserUseCase {
  async execute(id: string) {
    /* ... */
  }
}

export class UpdateUserUseCase {
  async execute(id: string, data: UpdateUserDto) {
    /* ... */
  }
}

// ❌ Evitar - Múltiples responsabilidades
export class UserService {
  getUser() {
    /* ... */
  }
  updateUser() {
    /* ... */
  }
  deleteUser() {
    /* ... */
  }
  sendEmail() {
    /* ... */
  } // No pertenece aquí
}
```

---

### O - Open/Closed Principle

**Abierto para extensión, cerrado para modificación:**

```typescript
// ✅ Bueno - Interface permite diferentes implementaciones
interface IUserRepository {
  findById(id: string): Promise<User>;
}

class UserPrismaRepository implements IUserRepository {
  /* ... */
}
class UserMongoRepository implements IUserRepository {
  /* ... */
} // Nueva implementación

// Sin modificar el código existente
```

---

### L - Liskov Substitution Principle

**Las subclases pueden reemplazar a sus clases base:**

```typescript
interface IRepository<T> {
  findById(id: string): Promise<T>;
}

// Ambas implementaciones son intercambiables
class PrismaRepository<T> implements IRepository<T> {
  /* ... */
}
class MongoRepository<T> implements IRepository<T> {
  /* ... */
}
```

---

### I - Interface Segregation Principle

**Interfaces específicas, no genéricas:**

```typescript
// ✅ Bueno - Interfaces específicas
interface IUserReader {
  findById(id: string): Promise<User>;
  findAll(): Promise<User[]>;
}

interface IUserWriter {
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

// Cliente solo implementa lo que necesita
class UserRepository implements IUserReader, IUserWriter {
  /* ... */
}

// ❌ Evitar - Interface genérica
interface IUserRepository {
  // Todo en uno
}
```

---

### D - Dependency Inversion Principle

**Depender de abstracciones, no de implementaciones concretas:**

```typescript
// ✅ Bueno - Depender de interfaz
@Injectable()
class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}
}

// ❌ Evitar - Depender de implementación concreta
@Injectable()
class GetUserUseCase {
  constructor(private userRepository: UserPrismaRepository) {}
}
```

---

## 📚 Recursos Adicionales

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Documentation](https://docs.nestjs.com)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Última actualización:** May 27, 2026
