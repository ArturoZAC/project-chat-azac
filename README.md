<div align="center">
  <h1>💬 Chat AZAC</h1>
  <p>
    Una plataforma de mensajería colaborativa en tiempo real construida con <strong>Next.js</strong>, <strong>NestJS</strong>, <strong>PostgreSQL</strong> y <strong>Socket.io</strong>.
  </p>
  <p>
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-features">Features</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-api-documentation">API Docs</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.7 | React framework with App Router |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Zustand** | 5.x | State management |
| **TanStack Query** | 5.x | Server state & caching |
| **React Hook Form** | 7.x | Form handling |
| **Zod** | 4.x | Schema validation |
| **Socket.io Client** | 4.x | Real-time communication |
| **Framer Motion** | 12.x | Animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 11.0.1 | Node.js framework |
| **TypeScript** | 5.7.3 | Type safety |
| **PostgreSQL** | 15+ | Primary database |
| **Prisma** | 7.8.0 | ORM |
| **Socket.io** | 4.8.3 | Real-time WebSockets |
| **JWT** | 11.x | Authentication |
| **Passport** | 0.7.0 | Auth strategies |
| **bcryptjs** | 3.x | Password hashing |
| **Nodemailer** | 8.x | Email service |
| **Winston** | 3.x | Logging |
| **Zod** | 4.x | Env validation |
| **pnpm** | Latest | Package manager |

---

## ✨ Features

### 🔐 Authentication & Users
- ✅ User registration & login with JWT
- ✅ Email verification flow
- ✅ Password reset via email
- ✅ User profiles (avatar, name, bio)
- ✅ Role-based access control (USER, ADMIN)
- ✅ Online/offline presence tracking

### 💬 Channels & Conversations
- ✅ Public & private channels
- ✅ Direct messages (1-to-1 conversations)
- ✅ Channel membership management
- ✅ Channel roles (OWNER, MEMBER, GUEST)
- ✅ Invitation links for private channels
- ✅ Last read tracking per user

### 📨 Real-Time Messaging
- ✅ Instant message delivery via WebSockets
- ✅ Message threads/replies
- ✅ Edit & delete messages
- ✅ Read receipts (multiple users)
- ✅ Typing indicators
- ✅ System messages

### 🔔 Notifications
- ✅ Real-time notifications for new messages
- ✅ Unread message counters
- ✅ Channel activity updates

### 🛡️ Admin Features
- ✅ User management
- ✅ Channel moderation
- ✅ System statistics dashboard

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **pnpm** ≥ 8.x ([Install](https://pnpm.io/installation))
- **PostgreSQL** ≥ 15 ([Download](https://www.postgresql.org/download/))
- **Git** ≥ 2.x

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/project-chat-azac.git
cd project-chat-azac

# 2. Setup Backend
cd backend
pnpm install
cp .env.template .env
# Edit .env with your configuration (see below)

# 3. Setup Database
createdb chat_azac
pnpm run prisma:migrate:deploy
pnpm run seed  # Optional: seed test data

# 4. Start Backend (in one terminal)
pnpm run start:dev
# Server runs on http://localhost:3100

# 5. Setup Frontend (in another terminal)
cd ../frontend
pnpm install
cp .env.template .env.local
# Edit .env.local with your configuration

# 6. Start Frontend
pnpm run dev
# App runs on http://localhost:3000
```

### Environment Variables

#### Backend (`backend/.env`)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chat_azac

# Server
PORT=3100
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=1d

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@chatazac.com

# URLs
APP_URL=http://localhost:3100
CLIENT_URL=http://localhost:3000
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3100
NEXT_PUBLIC_WS_URL=http://localhost:3100
```

---

## 📁 Project Structure

```
project-chat-azac/
├── backend/                    # NestJS API + WebSocket Server
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed script
│   ├── src/
│   │   ├── config/            # Env validation (Zod)
│   │   ├── application/       # Use Cases (Business Logic)
│   │   │   └── use-cases/
│   │   │       ├── auth/
│   │   │       ├── channels/
│   │   │       ├── messages/
│   │   │       └── users/
│   │   ├── domain/            # Entities & Repository Interfaces
│   │   │   ├── entities/
│   │   │   └── repositories/
│   │   ├── infrastructure/    # Implementations (DB, Email, Logger)
│   │   │   ├── auth/
│   │   │   ├── logger/
│   │   │   ├── mail/
│   │   │   └── prisma/
│   │   └── presentation/      # HTTP Controllers + WebSocket Gateway
│   │       ├── http/
│   │       │   ├── auth/
│   │       │   ├── channels/
│   │       │   ├── messages/
│   │       │   └── users/
│   │       └── websocket/
│   ├── test/                  # E2E tests
│   └── package.json
│
├── frontend/                   # Next.js Application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── modules/           # Feature modules
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   └── profile/
│   │   ├── shared/            # Shared utilities & stores
│   │   │   ├── interfaces/
│   │   │   └── store/
│   │   └── store/             # Global Zustand stores
│   ├── public/
│   └── package.json
│
├── docs/                       # Design docs & implementation plans
│   ├── specs/
│   └── plans/
│
├── .gitignore
└── README.md
```

---

## 🏗️ Architecture

The backend follows **Clean Architecture** with four layers:

```
┌─────────────────────────────────────┐
│     Presentation Layer (HTTP/WS)    │ ← Controllers, DTOs, Guards, Gateway
├─────────────────────────────────────┤
│     Application Layer               │ ← Use Cases (Single Responsibility)
├─────────────────────────────────────┤
│     Domain Layer                    │ ← Entities, Interfaces, Business Rules
├─────────────────────────────────────┤
│     Infrastructure Layer            │ ← Prisma Repos, Logger, Mail, Config
└─────────────────────────────────────┘
```

### Key Patterns
- **Repository Pattern** - Abstracts data access behind interfaces
- **Use Case Pattern** - One class per business operation
- **Mapper Pattern** - Transforms data between layers (Prisma ↔ Domain)
- **Dependency Injection** - Inversion of control via NestJS DI container

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (paginated) |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update profile |
| POST | `/api/users/:id/change-password` | Change password |
| DELETE | `/api/users/:id` | Delete user |

### Channels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels` | List channels |
| POST | `/api/channels` | Create channel |
| GET | `/api/channels/:id` | Get channel |
| PATCH | `/api/channels/:id` | Update channel |
| DELETE | `/api/channels/:id` | Delete channel |
| GET | `/api/channels/:id/members` | List members |
| POST | `/api/channels/:id/members` | Add member |
| DELETE | `/api/channels/:id/members/:userId` | Remove member |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels/:channelId/messages` | List messages |
| POST | `/api/channels/:channelId/messages` | Send message |
| PATCH | `/api/channels/:channelId/messages/:id` | Edit message |
| DELETE | `/api/channels/:channelId/messages/:id` | Delete message |
| POST | `/api/channels/:channelId/messages/:id/read` | Mark as read |

### WebSocket Events (Real-Time)
Connect to `ws://localhost:3100` with JWT in auth:

```javascript
const socket = io('http://localhost:3100', {
  auth: { token: 'your-jwt-token' }
});

// Messages
socket.emit('message:send', { channelId, content });
socket.on('message:new', (msg) => {});
socket.emit('message:edit', { messageId, content });
socket.on('message:updated', (msg) => {});

// Typing
socket.emit('user:typing', { channelId });
socket.emit('user:stop-typing', { channelId });

// Presence
socket.on('user:online', (data) => {});
socket.on('user:offline', (data) => {});
```

---

## 🧪 Testing

### Backend
```bash
cd backend

# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e
```

### Frontend
```bash
cd frontend

# Lint
pnpm run lint

# Build check
pnpm run build
```

---

## 📦 Scripts

### Backend
| Command | Description |
|---------|-------------|
| `pnpm run start:dev` | Dev server with hot reload |
| `pnpm run start:prod` | Production server |
| `pnpm run build` | Compile TypeScript |
| `pnpm run lint` | ESLint with auto-fix |
| `pnpm run format` | Prettier format |
| `pnpm run seed` | Seed database |
| `pnpm run prisma:studio` | Open Prisma Studio |

### Frontend
| Command | Description |
|---------|-------------|
| `pnpm run dev` | Dev server (Turbopack) |
| `pnpm run build` | Production build |
| `pnpm run start` | Production server |
| `pnpm run lint` | ESLint |

---

## 🗄️ Database Schema

### Core Models
- **User** - Accounts, profiles, roles, presence
- **Channel** - Public/private chat rooms
- **ChannelMember** - Membership with roles & last read
- **Conversation** - Direct messages (1-to-1)
- **ConversationMember** - DM participants
- **Message** - Channel/DM messages with threads
- **MessageRead** - Read receipts per user
- **ChannelInvitation** - Invite links for private channels
- **EmailVerification** - Email verification tokens
- **PasswordReset** - Password reset tokens

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/project-chat-azac.git
cd project-chat-azac
```

### 2. Create a Branch
```bash
git checkout main
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/your-bug-fix
```

### 3. Make Changes
- Follow existing code conventions
- Write clean, typed TypeScript
- Add tests for new functionality
- Keep commits small and focused

### 4. Test & Lint
```bash
# Backend
cd backend
pnpm run lint
pnpm run test
pnpm run format

# Frontend
cd ../frontend
pnpm run lint
pnpm run build
```

### 5. Commit (Conventional Commits)
```bash
git commit -m "feat(chat): add message threading support"
git commit -m "fix(auth): handle expired JWT gracefully"
git commit -m "docs: update API endpoints in README"
```

### 6. Push & Create PR
```bash
git push origin feature/your-feature-name
```
Then open a Pull Request on GitHub with:
- Clear title & description
- Link to related issues
- Screenshots for UI changes

---

## 📄 License

This project is **UNLICENSED** - all rights reserved.

---

## 📞 Support

- 🐛 **Bug Reports**: [Open an Issue](https://github.com/your-org/project-chat-azac/issues)
- 💡 **Feature Requests**: [Open an Issue](https://github.com/your-org/project-chat-azac/issues/new?labels=enhancement)
- 📧 **Contact**: Open an issue for questions

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Frontend (Local) | http://localhost:3000 |
| Backend API (Local) | http://localhost:3100 |
| Prisma Studio | http://localhost:5555 |
| NestJS Docs | https://docs.nestjs.com |
| Next.js Docs | https://nextjs.org/docs |
| Prisma Docs | https://www.prisma.io/docs |
| Socket.io Docs | https://socket.io/docs |

---

<div align="center">
  <sub>Built with ❤️ by the Chat AZAC team</sub>
  <br />
  <sub>Last updated: August 2026</sub>
</div>