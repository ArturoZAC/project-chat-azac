# Chat AZAC — Project Guide

## Stack

| Layer     | Tech                                           | Notes                         |
| --------- | ---------------------------------------------- | ----------------------------- |
| Backend   | NestJS 11 + Prisma 7.8 + PostgreSQL            | Clean Architecture            |
| Frontend  | Next.js 16.2 App Router                        | Screaming Architecture        |
| Auth      | JWT in httpOnly cookie (`token`)               | No refresh tokens; expires 1d |
| Real-time | Socket.io (server + client)                    | Cookie-based WS auth          |
| UI        | Tailwind CSS v4 + Tabler Icons + Framer Motion | Custom typography system      |

## Project structure

```
backend/          → NestJS API (port 3100)
  src/
    application/    → Use cases (one class = one operation)
    domain/         → Entities + repository interfaces
    infrastructure/ → Prisma, JWT strategy, mail, logger
    presentation/   → Controllers, guards, WebSocket gateway
  prisma/           → Schema, migrations, seed
  generated/prisma/ → Prisma client output (NOT @prisma/client)
frontend/         → Next.js app (port 5173 or 3000)
  src/
    app/            → Routes only (page.tsx, layouts)
    modules/auth/   → Auth logic (actions, api, store, components)
    shared/ui/      → Container, Banner, Toast
    store/          → Zustand stores
```

## Key commands

### Backend (`cd backend`)

- `pnpm run start:dev` — dev with watch
- `pnpm run build` — compile
- `pnpm run lint` — ESLint with --fix
- `pnpm run format` — Prettier (singleQuote, trailingComma all)
- `pnpm run test` — Jest (rootDir: src, pattern: `*.spec.ts`)
- `pnpm run seed` — creates 10 users, password: `Password123!`
- `pnpm run prisma:migrate:dev --name <name>` — new migration
- `pnpm run prisma:studio` — DB UI at localhost:5555

### Frontend (`cd frontend`)

- `pnpm run dev` — Next.js dev server
- `pnpm run build` — production build
- `pnpm run lint` — ESLint (next/core-web-vitals + typescript)

## Backend architecture

```
Controller → UseCase → Domain Repository Interface → Prisma Repository (Infra)
```

- Controllers are thin; all logic lives in use cases under `application/use-cases/`
- Domain repositories are interfaces; infrastructure provides the implementation via `{ provide: X, useClass: Y }` in modules
- Mappers transform between Prisma models and domain entities
- Global `@ApiPrefix('api')`, global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`
- All responses wrapped in `{ success: boolean, data, message }` by `ResponseInterceptor`
- Auth via httpOnly cookie (`token`), extracted by `JwtStrategy` from `req.cookies.token`
- `@Auth()` decorator applies JWT guard + optional role guard; `@Public()` skips auth
- Prisma client imported from `../generated/prisma` (NOT `@prisma/client`)
- Prisma uses `@prisma/adapter-pg` (see seed.ts and prisma.config.ts)
- `envs` object is validated at startup with Zod; process exits if missing vars

### WebSocket (Socket.io)

- Gateway authenticates via JWT from cookie (parsed manually in `getUserFromSocket`)
- Rooms: `user:{userId}` for direct notifications, `channel:{channelId}` for channel events
- Events: `message.send`, `message.edit`, `message.delete`, `channel.join`
- Server emits: `message.sent`, `message.edited`, `message.deleted`, `user.online`, `user.offline`, `channel.joined`
- Disconnects unauthenticated clients

### Auth endpoints

| Method | Path                          | Description                        |
| ------ | ----------------------------- | ---------------------------------- |
| POST   | /api/auth/register            | Register (returns user, no cookie) |
| POST   | /api/auth/login               | Login (sets httpOnly cookie)       |
| GET    | /api/auth/verify-email        | Query param `?token=`              |
| POST   | /api/auth/forgot-password     | Sends recovery email               |
| POST   | /api/auth/reset-password      | Resets password                    |
| POST   | /api/auth/resend-verification | Resends verification email         |

## Frontend conventions

### Routes

```
/(auth)/login         → Login page (with AuthBranding sidebar)
/(auth)/register      → Register page (with AuthBranding sidebar)
/(auth-solo)/forgot-password
/(auth-solo)/verify-email
/(auth-solo)/reset-password
/                     → Landing (placeholder)
```

### Typography (globals.css)

- **Never use Tailwind text-\* classes** — use the system classes instead
- Body font: Montserrat (CSS var `--font-montserrat`)
- Heading font: Sora (CSS var `--font-sora`)
- Classes: `.display`, `.lead`, `.lead2`, `.h2-hero`, `.h3-card`, `.subtitle1`, `.subtitle2`
- Color variants: `-white`, `-primary`, `-muted` (e.g. `.p-white`, `.h1-primary`, `.small-muted`)
- Theme colors as CSS vars: `--color-primary` (#7c3aed), `--color-black` (#111111), etc.

### Styling rules

- Tailwind CSS v4 with `@tailwindcss/postcss` plugin
- Use `@theme inline {}` CSS vars for colors
- No Tailwind `text-white`, `text-black` — use system classes
- No Tailwind `text-xs` through `text-9xl` — use system typography
- Framer Motion for all animations
- Tabler Icons (@tabler/icons-react) for all icons

## Important quirks

- Backend `.env` is NOT auto-loaded by Prisma. Uses `prisma.config.ts` with `dotenv/config` for Prisma CLI standalone commands. The app loads `.env` via `import 'dotenv/config'` in envs.ts
- Backend ESLint: `no-explicit-any: off`, `no-floating-promises: warn`, `no-unsafe-argument: warn`. Uses `@typescript-eslint/recommended-type-checked` with `projectService: true`
- Backend tsconfig: `module: nodenext`, `moduleResolution: nodenext`, decorators enabled
- Frontend `NEXT_PUBLIC_API_URL` must point to backend (e.g. `http://localhost:3100`)
- No middleware.ts exists; frontend page routes are unprotected
- Backend `logs/` directory (gitignored) receives Winston logs
- NestJS `nest-cli.json` copies `../generated/**/*` to dist as assets
- Backend `pnpm-workspace.yaml` allows builds for `@nestjs/core`, `@prisma/engines`, `prisma`, `unrs-resolver`
- Frontend `pnpm-workspace.yaml` allows `sharp`, ignores `unrs-resolver` as dep
