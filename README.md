# DevOps Task App — Application Layer

This is a complete starter **application layer** for your DevOps project.

It includes:
- **frontend**: React + Vite
- **auth-service**: Node.js + Express + PostgreSQL + JWT
- **task-service**: Node.js + Express + PostgreSQL + JWT
- **database**: PostgreSQL schema and seed files

## Project structure

```txt
frontend/
services/
  auth-service/
  task-service/
database/
docs/
```

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

## 1) Create PostgreSQL database

```sql
CREATE DATABASE taskapp;
```

Then run the schema:

```bash
psql -U postgres -d taskapp -f database/schema.sql
```

Optional seed:

```bash
psql -U postgres -d taskapp -f database/seed.sql
```

## 2) Configure environment variables

Create these files:

### `services/auth-service/.env`
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskapp
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
```

### `services/task-service/.env`
```env
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskapp
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
AUTH_SERVICE_URL=http://localhost:5001
```

### `frontend/.env`
```env
VITE_AUTH_API_URL=http://localhost:5001
VITE_TASK_API_URL=http://localhost:5002
```

## 3) Install dependencies

### Auth service
```bash
cd services/auth-service
npm install
npm run dev
```

### Task service
```bash
cd services/task-service
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Services
- Frontend: http://localhost:5173
- Auth service: http://localhost:5001
- Task service: http://localhost:5002

## Features
- Register
- Login
- JWT-based auth
- Protected task CRUD
- Tasks scoped to logged-in user

## API summary

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/verify`

### Tasks
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

## Notes
This is intentionally simple so you can move next into:
1. Docker
2. Docker Compose
3. GitHub Actions
4. Kubernetes
5. Terraform
6. AWS deployment
