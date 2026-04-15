# Rally Board Backend

Express API for a Rally-style board with MySQL (default) and optional PostgreSQL support.

## 1) Setup

1. Copy `.env.example` to `.env`.
2. For MySQL, set `MYSQL_*` values in `.env`.
3. Optional: switch to PostgreSQL by setting `DB_CLIENT=postgres` and `DATABASE_URL`.
3. Install dependencies:

```bash
npm install
```

## 2) Database

Create a database named `rally_board` (or update your `.env` values):

```sql
CREATE DATABASE rally_board;
```

Seed schema and starter stories:

```bash
npm run db:seed
```

## 3) Run API

```bash
npm run dev
```

Server runs on `http://localhost:4000` by default.

## API Endpoints

- `GET /health`
- `GET /api/stories`
- `POST /api/stories`
- `PATCH /api/stories/:id`
- `DELETE /api/stories/:id`
