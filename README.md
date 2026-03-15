# Obliq - RBAC Backend 

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache%20%26%20Session-DC382D?logo=redis&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)

A production-ready Role-Based Access Control (RBAC) REST API backend built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Redis.

This system supports dynamic permission management where admins and managers can grant or revoke access to features for specific users in real time.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture and Access Model](#architecture-and-access-model)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Permission Atoms](#permission-atoms)
- [Role Permissions Matrix](#role-permissions-matrix)
- [Folder Structure](#folder-structure)
- [Default Admin Credentials](#default-admin-credentials)
- [Contributing](#contributing)

## Overview

Obliq - rbac backend provides:

- JWT-based authentication with access and refresh token strategy
- Dynamic permission assignment and revocation
- Role-aware data visibility and action control
- Redis-backed token and permission caching
- Security hardening and request throttling for production workloads

## Tech Stack

- Runtime: Node.js with TypeScript
- Framework: Express.js v5
- ORM: Prisma v7
- Database: PostgreSQL
- Cache and Session: Redis (ioredis)
- Authentication: JWT (Access Token 15 minutes, Refresh Token 7 days via httpOnly cookie)
- Validation: Zod
- Password Hashing: bcryptjs
- Rate Limiting: express-rate-limit
- Security: Helmet, CORS
- Logging: Morgan

## Architecture and Access Model

### Roles

- ADMIN: Full system control
- MANAGER: Manage own team (agents and customers), grant/revoke permissions
- AGENT: Access only what manager has unlocked
- CUSTOMER: Self-service portal access only

### Access Rules

- Permissions are data-driven, not hard-coded in business logic
- Permission grants follow a grant ceiling rule: users can grant only permissions they already own
- Managers are scoped to users they created
- User lifecycle is enforced through status transitions: ACTIVE, SUSPENDED, BANNED

## Key Features

1. Dynamic permission system with runtime grant/revoke support
2. Grant ceiling enforcement for secure delegation
3. JWT auth with Redis-based refresh token storage and access token blacklisting
4. Role-based user scoping (manager sees own team only)
5. Permission caching via Redis with short TTL and invalidation on change
6. Full audit trail for sensitive operations
7. Brute-force protection via login rate limiting
8. User lifecycle management across ACTIVE, SUSPENDED, and BANNED states

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd obliq-backend
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and fill required values from the [Environment Variables](#environment-variables) section.

### 3. Prepare database and Prisma client

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Seed initial data

Use one of the following:

```bash
npm run seed
```

or

```bash
npx prisma db seed
```

### 5. Run development server

```bash
npm run dev
```

Server starts on `PORT` (default: `5000` if configured that way).

## Environment Variables

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@localhost:5432/obliq_rbac` | PostgreSQL connection string |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection URL |
| `JWT_ACCESS_SECRET` | Yes | `super-secret-access` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | `super-secret-refresh` | Refresh token signing secret |
| `JWT_ACCESS_EXPIRES` | Yes | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES` | Yes | `7d` | Refresh token expiry |
| `PORT` | Yes | `5000` | API server port |
| `NODE_ENV` | Yes | `development` | Runtime environment |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run development server with watch mode |
| `npm run build` | Build TypeScript to `dist` |
| `npm run start` | Run production build |
| `npm run seed` | Run application seed file |
| `npm run prisma:migrate` | Run Prisma migrations in development |
| `npm run prisma:studio` | Open Prisma Studio |
| `npx prisma db seed` | Run Prisma seed command |

## API Endpoints

> Base prefix: `/api/v1`

### Auth Module

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user and issue tokens |
| `POST` | `/api/v1/auth/refresh` | Rotate and issue new access token |
| `POST` | `/api/v1/auth/logout` | Invalidate active session/tokens |

### Users Module

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/users` | List users with filters/pagination |
| `POST` | `/api/v1/users` | Create user |
| `GET` | `/api/v1/users/:id` | Get user details |
| `PATCH` | `/api/v1/users/:id` | Update user profile fields |
| `DELETE` | `/api/v1/users/:id` | Delete user |
| `PATCH` | `/api/v1/users/:id/status` | Update user lifecycle status |

### Permissions Module

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/permissions` | List available permissions |
| `GET` | `/api/v1/permissions/my` | List current user effective permissions |
| `GET` | `/api/v1/permissions/user/:userId` | Get effective permissions for a target user |
| `POST` | `/api/v1/permissions/user/:userId/grant` | Grant user-level permission |
| `POST` | `/api/v1/permissions/user/:userId/revoke` | Revoke user-level permission |

### Roles Module

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/roles` | List all roles |
| `GET` | `/api/v1/roles/:id/permissions` | Get role default permissions |

### Audit Module

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/audit` | Retrieve action logs/audit trail |

## Database Models

- `User`
- `Role`
- `Permission`
- `RolePermission`
- `UserPermission`
- `AuditLog`

## Permission Atoms

| Atom | Module | Description |
|---|---|---|
| `view:dashboard` | dashboard | View dashboard |
| `view:users` | users | View users list |
| `manage:users` | users | Update user information |
| `create:users` | users | Create users |
| `delete:users` | users | Delete users |
| `view:leads` | leads | View leads |
| `manage:leads` | leads | Manage leads |
| `view:tasks` | tasks | View tasks |
| `manage:tasks` | tasks | Manage tasks |
| `view:reports` | reports | View reports |
| `export:reports` | reports | Export reports |
| `view:audit` | audit | View audit logs |
| `manage:permissions` | permissions | Grant/revoke permissions |
| `view:settings` | settings | View settings |
| `manage:settings` | settings | Manage settings |

## Role Permissions Matrix

This is the default access model used at seed time (effective access may change via dynamic grants/revokes):

| Permission Scope | ADMIN | MANAGER | AGENT | CUSTOMER |
|---|---|---|---|---|
| Core management features | Full access | Team scoped | Limited | None |
| User management | Full access | Team scoped | No | No |
| Permission management | Full access | Allowed (grant ceiling enforced) | No | No |
| Operational modules (leads/tasks/messages) | Full access | Broad access | Assigned subset | Self-service only |
| Audit visibility | Yes | Typically restricted/partial by policy | No | No |

## Folder Structure

```text
src/
├── config/
├── middleware/         (authenticate, authorize, rate limiter, error handler)
├── modules/
│   ├── auth/           (login, refresh, logout)
│   ├── users/          (CRUD + status management)
│   ├── permissions/    (grant, revoke, resolve)
│   ├── roles/          (list roles and role permissions)
│   └── audit/          (append-only action log)
├── utils/              (jwt, redis, api response, resolve permissions)
└── types/              (express.d.ts)

prisma/
├── schema.prisma
└── seed.ts
```

## Default Admin Credentials

After seeding:

- Email: `admin@obliq.com`
- Password: `Admin@1234`

Change these credentials immediately in non-local environments.

## Contributing

1. Fork the repository
2. Create a feature branch (`feature/your-change`)
3. Commit with clear messages
4. Add or update tests for behavior changes
5. Open a pull request with:
   - Problem statement
   - Scope of change
   - Validation steps

### Suggested Quality Checks

```bash
npm run build
npm run dev
npm run seed
```

---

If you want, a Postman collection section and deployment section (Docker/PM2/Nginx) can be added next.
