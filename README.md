# Rally Board Replica (Frontend + Backend + MySQL)

This workspace contains a Rally-style board replica:

- `frontend/my-app`: React + Vite UI
- `backend`: Express API + MySQL persistence (PostgreSQL optional)

## Prerequisites

- Node.js 18+
- MySQL 8+ (or PostgreSQL 14+ in optional mode)

## Backend Setup

1. Open `backend` folder.
2. Copy `.env.example` to `.env`.
3. Set database values in `.env` (`MYSQL_*` by default).
4. Install dependencies and seed data:

```bash
npm install
npm run db:seed
npm run dev
```

Backend starts at `http://localhost:4000`.

## Frontend Setup

1. Open `frontend/my-app` folder.
2. Copy `.env.example` to `.env`.
3. Install and run:

```bash
npm install
npm run dev
```

Frontend starts at `http://localhost:5173` and reads API URL from `VITE_API_BASE_URL`.

## Features Included

- Rally-like lane board: Backlog, In Progress, Review, Done
- Create new stories
- Move stories between statuses
- Delete stories
- Search and priority filter
- Live board stats from backend data
