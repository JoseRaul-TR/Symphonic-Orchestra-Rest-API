<!-- README.md -->

# Symphonic Orchestra REST API

A data-driven REST API for managing a symphonic orchestra — musicians,
instrument inventory and their relationships.
Built with **Node.js**, **Express**, **TypeScript** (strict mode) and **MySQL**.

## Features

- Full CRUD for musicians and instruments.
- Filtering, sorting and pagination on all list endpoints.
- Aggregate stats endpoint (GROUP BY section with COUNT and AVG salary).
- Instrument inventory with owner details via SQL JOIN.
- API key authentication for all write operations.
- Environment-aware error handling and CORS.
- Structured logging to `access.log` / `error.log`.
- Graceful shutdown (SIGTERM, SIGINT, terminal input).

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
- MySQL 8.0 or later with a database called `orchestra_db`

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

| Variable       | Required | Description                       | Default                 |
| -------------- | -------- | --------------------------------- | ----------------------- |
| `PORT`         | No       | Server port                       | `3000`                  |
| `NODE_ENV`     | No       | `development` or `production`     | `development`           |
| `DB_HOST`      | **Yes**  | MySQL host                        | —                       |
| `DB_PORT`      | **Yes**  | MySQL port                        | —                       |
| `DB_USER`      | **Yes**  | MySQL username                    | —                       |
| `DB_PASSWORD`  | **Yes**  | MySQL password                    | —                       |
| `DB_NAME`      | **Yes**  | Database name                     | —                       |
| `API_KEY`      | **Yes**  | Secret key for write endpoints    | —                       |
| `FRONTEND_URL` | No       | Allowed CORS origin in production | `http://localhost:5173` |

Generate a secure API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Running the Server

```bash
# Development (auto-reload on save)
npm run dev

# Production build and start
npm run build && npm start

# Type check without compiling
npm run lint
```

Shut down gracefully at any time by typing `exit` (or `quit`, `bye`, `ciao`,
`hasta la vista`, `vi ses`) in the terminal, or with **Ctrl+C**.

## API Overview

Base URL: `http://localhost:3000/api/v1`

### Authentication

Write operations (POST / PUT / PATCH / DELETE) require the header: "x-api-key: [your_api_key]"

### Health Check

Returns server status, environment and uptime. Not versioned.

### Endpoints

Returns server status, environment and uptime. Not versioned.

### Musicians `/api/v1/musicians`

| Method | Path     | Auth | Description                              |
| ------ | -------- | ---- | ---------------------------------------- |
| GET    | `/`      | —    | List musicians with filters + pagination |
| GET    | `/stats` | —    | Aggregate stats by section               |
| GET    | `/:id`   | —    | Get one musician by ID                   |
| POST   | `/`      | ✅   | Create a musician                        |
| PUT    | `/:id`   | ✅   | Replace a musician (full update)         |
| PATCH  | `/:id`   | ✅   | Update a musician (partial)              |
| DELETE | `/:id`   | ✅   | Delete a musician                        |

**Filters** (query string): `orchestra_member`, `nationality`, `section`, `main_instrument`, `role`

**Sorting**: `?sortBy=salary_per_day&order=DESC`
Valid columns: `name`, `surname`, `nationality`, `join_date`, `section`, `main_instrument`, `role`, `salary_per_day`

**Pagination**: `?page=1&limit=20` (max limit: 100)

---

### Instruments `/api/v1/instruments`

| Method | Path         | Auth | Description                                |
| ------ | ------------ | ---- | ------------------------------------------ |
| GET    | `/`          | —    | List instruments with filters + pagination |
| GET    | `/inventory` | —    | Full inventory with musician owner details |
| GET    | `/:id`       | —    | Get one instrument by ID                   |
| POST   | `/`          | ✅   | Create an instrument                       |
| PUT    | `/:id`       | ✅   | Replace an instrument (full update)        |
| PATCH  | `/:id`       | ✅   | Update an instrument (partial)             |
| DELETE | `/:id`       | ✅   | Delete an instrument                       |

**Filters**: `type`, `brand`, `owner_type`, `owner_id`

**Sorting**: `?sortBy=value&order=DESC` (virtual field using `COALESCE(estimated_value, purchase_price)`)
Valid columns: `type`, `brand`, `purchase_price`, `estimated_value`, `manufacture_year`, `purchase_date`, `sell_date`, `sell_price`, `owner_type`, `rent_fee_per_day`

**Pagination**: `?page=1&limit=20` (max limit: 100)

---

### Example Requests

```bash
# Get all Strings section musicians sorted by salary
curl "http://localhost:3000/api/v1/musicians/?section=Strings&sortBy=salary_per_day&order=DESC"

# Get musician stats by section
curl "http://localhost:3000/api/v1/musicians/stats"

# Get instrument inventory with owner names
curl "http://localhost:3000/api/v1/instruments/inventory?owner_type=Musician"

# Create an orchestra member (requires API key)
curl -X POST "http://localhost:3000/api/v1/musicians/" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "name": "Elena", "surname": "Rossi",
    "birth_date": "1990-03-15",
    "orchestra_member": true,
    "join_date": "2015-09-01",
    "nationality": "Italian",
    "section": "Strings",
    "main_instrument": "Violin I",
    "role": "Tutti",
    "salary_per_day": 320.50
  }'
```

## Project Structure

```
src/
├── config/         # env validation, DB pool, typed config object
│   ├── db.ts
│   └── env.ts
├── controllers/    # HTTP layer: parse request, send response
│   ├── instrumentsController.ts
│   └── musiciansController.ts
├── middleware/     # auth, validation, error handling, logging
│   ├── auth.ts
│   ├── errorHandler.ts
│   ├── requestLogger.ts
│   ├── validateId.ts
│   ├── validateInstrument.ts
│   └── validateMusician.ts
├── routes/         # route definitions (versioned under /api/v1)
│   ├── instrumentsRoutes.ts
│   ├── musiciansRoutes.ts
│   └── v1.ts
├── services/       # business logic and DB queries
│   ├── instrumentsService.ts
│   └── musiciansService.ts
├── types/          # TypeScript interfaces and DTOs
│   ├── instruments.ts
│   ├── musicians.ts
│   └── pagination.ts
├── utils/          # shared helpers (pagination, logging, async wrapper)
│   ├── AppError.ts
│   ├── asyncHandler.ts
│   ├── logger.ts
│   ├── pagination.ts
│   ├── queryHelper.ts
│   ├── requestUtils.ts
│   └── terminalColors.ts
├── app.ts
└── server.ts

```

## Logging

All requests are logged to `access.log`. Errors are logged to `error.log`.
Client IP is recorded for mutations and error responses.

## License

MIT © José Raúl Tenza Ramírez
