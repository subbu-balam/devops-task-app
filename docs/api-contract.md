# API Contract

## Auth Service

### POST /auth/register
```json
{
  "name": "Subbu",
  "email": "subbu@example.com",
  "password": "123456"
}
```

### POST /auth/login
```json
{
  "email": "subbu@example.com",
  "password": "123456"
}
```

## Task Service
All routes require:

```http
Authorization: Bearer <token>
```

### POST /tasks
```json
{
  "title": "Learn Docker",
  "description": "Finish Docker basics",
  "status": "todo"
}
```
