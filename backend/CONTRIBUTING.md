# 🤝 Guía de Contribución - Chat AZAC

Gracias por tu interés en contribuir a **Chat AZAC**. Este documento te guiará sobre cómo hacerlo de manera efectiva.

---

## 📋 Código de Conducta

- Sé respetuoso con todos los miembros de la comunidad
- Proporciona feedback constructivo
- Enfócate en lo que es mejor para la comunidad
- Muestra empatía hacia otros miembros

---

## 🐛 Reportar Bugs

### Antes de reportar
- Verifica si el bug ya ha sido reportado en Issues
- Intenta reproducir el bug en la última versión del código

### Cómo reportar
1. Usa un título descriptivo y claro
2. Describe los pasos exactos para reproducir el problema
3. Proporciona ejemplos específicos para demostrar los pasos
4. Describe el comportamiento observado y qué era lo esperado
5. Incluye capturas de pantalla o logs si es relevante
6. Incluye tu versión de Node.js, pnpm y Sistema Operativo

**Ejemplo:**

```
Título: Login fallido cuando la base de datos no está disponible

Pasos para reproducir:
1. Detener el servidor PostgreSQL
2. Intentar login en la aplicación
3. Ver error

Comportamiento esperado:
Mensaje de error clara: "Base de datos no disponible"

Comportamiento actual:
Crash de la aplicación sin mensaje de error
```

---

## 💡 Sugerir Mejoras

Si tienes ideas para mejorar Chat AZAC:

1. Abre un Issue con el label `enhancement`
2. Describe la mejora y por qué crees que sería útil
3. Espera feedback de los maintainers antes de trabajar en código

---

## 🚀 Comenzar con Desarrollo

### 1. Fork del repositorio

```bash
# Hacer fork en GitHub
# Luego clonar tu fork
git clone https://github.com/TU_USERNAME/project-chat-azac.git
cd project-chat-azac/backend
```

### 2. Crear una rama para tu feature

```bash
# Asegúrate de estar en la rama main
git checkout main

# Crea una rama con un nombre descriptivo
git checkout -b feature/nombre-del-feature
# o para bugfixes
git checkout -b bugfix/nombre-del-bug
```

### 3. Hacer cambios

- Sigue las convenciones de código del proyecto
- Escribe código limpio y legible
- Añade comentarios donde sea necesario
- Realiza commits pequeños y descriptivos

### 4. Testear tus cambios

```bash
# Ejecutar tests unitarios
pnpm run test

# Ejecutar con coverage
pnpm run test:cov

# Ejecutar linter
pnpm run lint

# Formatear código
pnpm run format
```

### 5. Hacer push y abrir Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-del-feature
```

Luego en GitHub:
1. Ve a tu fork
2. Click en "Compare & pull request"
3. Describe tus cambios:
   - **Qué** cambiaste
   - **Por qué** lo cambiaste
   - **Cómo** testeaste los cambios
4. Reference issues relacionados (e.g., `Fixes #123`)

---

## 📝 Convenciones de Código

### Commits

Usamos **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos:**
- `feat` - Nueva feature
- `fix` - Corrección de bug
- `docs` - Cambios en documentación
- `style` - Cambios que no afectan el código (formato, etc)
- `refactor` - Refactorizar código sin cambiar funcionalidad
- `perf` - Mejoras de performance
- `test` - Añadir o actualizar tests
- `chore` - Cambios en build, deps, etc

**Ejemplos:**

```bash
git commit -m "feat(users): add password reset endpoint"
git commit -m "fix(auth): validate jwt token expiration"
git commit -m "docs: update README with setup instructions"
```

### Estructura de Carpetas

Sigue la estructura existente:

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

### Nombres de Archivos y Variables

- **Archivos**: `kebab-case.ts` (e.g., `user.controller.ts`)
- **Clases**: `PascalCase` (e.g., `UserController`)
- **Variables/Funciones**: `camelCase` (e.g., `getUserById()`)
- **Constantes**: `UPPER_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`)

### Tipado TypeScript

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

### Imports

```typescript
// Agrupar en orden:
// 1. Node modules
// 2. Módulos del proyecto
// 3. Tipos y interfaces

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import type { User } from '@/domain/entities/user.entity';
```

---

## 🧪 Testing

### Tests Unitarios

```bash
pnpm run test
```

### Tests End-to-End

```bash
pnpm run test:e2e
```

### Coverage

```bash
pnpm run test:cov
```

**Directrices:**
- Aim por al menos 80% de cobertura
- Testea casos happy path y error cases
- Usa descriptivas descripciones en los tests

### Ejemplo de Test

```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    // Setup
  });

  it('should return user by id', async () => {
    // Arrange
    const userId = '123';
    const expectedUser = { id: userId, name: 'John' };

    // Act
    const result = await service.getUserById(userId);

    // Assert
    expect(result).toEqual(expectedUser);
  });
});
```

---

## 📖 Documentación

Si añades una nueva feature:

1. **Actualiza el README.md** si es necesario
2. **Documenta funciones públicas** con JSDoc comments:

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

---

## ✅ Checklist antes de Submit PR

- [ ] Mi código sigue las convenciones del proyecto
- [ ] He ejecutado `pnpm run lint` y `pnpm run format`
- [ ] He añadido tests para mis cambios
- [ ] Los tests pasan: `pnpm run test`
- [ ] He actualizado la documentación si es necesario
- [ ] Mis commits tienen mensajes descriptivos
- [ ] Mi rama está actualizada con main: `git pull origin main`
- [ ] No he incluido cambios no relacionados

---

## 🔄 Proceso de Review

1. Mínimo un maintainer revieweará tu PR
2. Pueden pedirse cambios
3. Una vez aprobado, tu PR será mergeado
4. Tu rama será eliminada después del merge

---

## 🎓 Recursos Útiles

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ❓ Preguntas?

- Abre un Issue con el label `question`
- Contacta a los maintainers

---

**¡Gracias por contribuir a Chat AZAC! 🚀**
