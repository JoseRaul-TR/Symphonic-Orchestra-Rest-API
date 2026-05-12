//README.md

# Symphonic Orchestra REST API

A data-driven REST API for managing a symphonic orchestra's musicians and instrument inventory.
Built with **Node.js**, **Express 5**, **TypeScript** and **MySQL**.

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Runtime   | Node.js (ESM)                     |
| Framework | Express 5                         |
| Language  | TypeScript (strict mode)          |
| Database  | MySQL 8 via mysql2/promise        |
| Auth      | Static API Key (X-API-Key header) |

## Prerequisites

- Node.js 20+
- MySQL 8.0+
- A database named `orchestra_db` (or your choice)

## Installation

```bash
git clone https://github.com/JoseRaul-TR/Symphonic-Orchestra-Rest-API.git
cd Symphonic-Orchestra-Rest-API
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable      | Description                              | Example            |
| ------------- | ---------------------------------------- | ------------------ |
| `PORT`        | Server port                              | `3000`             |
| `DB_HOST`     | MySQL host                               | `localhost`        |
| `DB_PORT`     | MySQL port                               | `3306`             |
| `DB_USER`     | MySQL username                           | `root`             |
| `DB_PASSWORD` | MySQL password                           | `secret`           |
| `DB_NAME`     | Database name                            | `orchestra_db`     |
| `API_KEY`     | Secret key for write endpoints           | `test-API-key-123` |
| `NODE_ENV`    | Environment (`development`/`production`) | `development`      |

Generate a secure API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Running the Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm run build && npm start

# Type check
npm run lint
```

## API Overview

Base URL: `http://localhost:3000/api/v1`

### Authentication

Write operations (POST / PUT / PATCH / DELETE) require the header:

### Endpoints

#### Musicians

| Method | Route              | Auth | Description                          |
| ------ | ------------------ | ---- | ------------------------------------ |
| GET    | `/musicians`       | —    | All musicians (filters + pagination) |
| GET    | `/musicians/stats` | —    | Aggregate stats by section           |
| GET    | `/musicians/:id`   | —    | Single musician                      |
| POST   | `/musicians`       | ✅   | Create musician                      |
| PUT    | `/musicians/:id`   | ✅   | Replace musician                     |
| PATCH  | `/musicians/:id`   | ✅   | Partial update                       |
| DELETE | `/musicians/:id`   | ✅   | Delete musician                      |

#### Instruments

| Method | Route                    | Auth | Description                            |
| ------ | ------------------------ | ---- | -------------------------------------- |
| GET    | `/instruments`           | —    | All instruments (filters + pagination) |
| GET    | `/instruments/inventory` | —    | Instruments with owner details (JOIN)  |
| GET    | `/instruments/:id`       | —    | Single instrument                      |
| POST   | `/instruments`           | ✅   | Create instrument                      |
| PUT    | `/instruments/:id`       | ✅   | Replace instrument                     |
| PATCH  | `/instruments/:id`       | ✅   | Partial update                         |
| DELETE | `/instruments/:id`       | ✅   | Delete instrument                      |

### Query Parameters

**Pagination** (all GET list endpoints):

- `?page=1` — page number (default: 1)
- `?limit=20` — results per page (default: 20, max: 100)

**Musicians filters:** `orchestra_member`, `nationality`, `section`, `main_instrument`, `role`

**Instruments filters:** `type`, `brand`, `owner_type`, `owner_id`

**Sorting:** `?sortBy=salary_per_day&order=DESC`

### Health Check

Returns server status, environment and uptime. Not versioned.

## Logging

All requests are logged to `access.log`. Errors are logged to `error.log`.
Client IP is recorded for mutations and error responses.

## Graceful Shutdown

The server handles `SIGTERM`, `SIGINT` (Ctrl+C) and terminal input (`exit`, `quit`, `bye`, `ciao`, `vi ses`, `hasta la vista`).
