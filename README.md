# Autocomplete API

A Redis-backed autocomplete API service with HTTP support, built with Node.js, TypeScript, Express, and Redis Stack.

## Features

- **Full-text search** – Redis Stack (RediSearch) powers fast autocomplete suggestions
- **Rate limiting** – Redis-backed rate limiting with configurable rules
- **Authorization** – Bearer token authentication
- **REST API** – Query autocomplete suggestions via `/api/v1/autocomplete`

## Prerequisites

- **Node.js** 18+ 
- **Redis Stack** – Required for RediSearch (FT.SEARCH). Use [Redis Stack Server](https://redis.io/docs/stack/get-started/install/docker/) or Docker.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start Redis (Docker)

```bash
docker compose up -d redis_words redis_auth
```

### 3. Build and run

```bash
npm run dev
```

The server runs at **http://localhost:3001**

## Environment Variables

Copy `.env.example` to `.env` and customize. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3001` |
| `REDIS_HOST` | Redis host for word search | `redis_words` |
| `REDIS_PORT` | Redis port for word search | `6379` |
| `REDIS_PASSWORD` | Redis auth password | _(required)_ |
| `REDIS_AUTH_HOST` | Redis host for rate limiting | `redis_auth` |
| `REDIS_AUTH_PORT` | Redis port for rate limiting | `6379` |
| `REDIS_WORDS_PORT` | External port for redis_words | `6379` |
| `REDIS_AUTH_PORT_EXTERNAL` | External port for redis_auth | `6380` |
| `REDIS_INSIGHT_PORT` | Redis Insight UI port | `5540` |
| `NGINX_HTTP_PORT` | Nginx HTTP port | `80` |
| `NGINX_HTTPS_PORT` | Nginx HTTPS port | `443` |

**Docker:** Containers use service names (`redis_words`, `redis_auth`). External connections use host ports `6379` and `6380`.

For local development (with Redis running in Docker Compose):

```bash
REDIS_HOST=127.0.0.1 REDIS_PORT=6379 REDIS_AUTH_HOST=127.0.0.1 REDIS_AUTH_PORT=6380 npm run dev
```

## API Usage

### Autocomplete

```http
GET /api/v1/autocomplete/:key?limit=10&sort=ASC
Authorization: Bearer <your-token>
```

**Parameters:**

- `key` or `q` – Search query
- `limit` – Max results (1–10, default 5)
- `sort` – `ASC` or `DESC`

**Example:**

```bash
curl -H "Authorization: Bearer SECRET_TOKEN" \
  "http://localhost:3001/api/v1/autocomplete/apple?limit=5"
```

## Postman

A Postman collection is included in `postman/`:

1. Import `postman/Autocomplete-API.postman_collection.json` into Postman
2. Optionally import `postman/Autocomplete-Local.postman_environment.json` and select it
3. Set variables as needed:
   - `baseUrl` – API base URL (default: `http://localhost:3001`)
   - `authToken` – Bearer token for API (e.g. `SECRET_TOKEN`)
   - `adminToken` – Admin key for secret routes
   - `searchQuery`, `category`, `limit`, `sort` – per-request overrides

## Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Build TypeScript to `build/` |
| `npm run compile:watch` | Build in watch mode |
| `npm run dev` | Compile and run the server |
| `npm run http` | Run the compiled server |
| `npm run ws` | Run WebSocket server |
| `npm run start` | Run with PM2 |
| `npm run build` | Compile and obfuscate for production |

## Data Indexing

The autocomplete service uses Redis Stack (RediSearch) with pre-indexed word data. On first run, you need to create indexes and feed data from `src/core/db/data/` (e.g. `a.txt`, `b.txt`, `urban_d.txt`).

**Option 1 – Bash script (host):** Start Redis + app, then run:

```bash
./scripts/load-data.sh
# or: npm run load-data
```

**Option 2 – Docker (after `docker compose up -d`):**

```bash
docker compose run --rm data_loader
# or: npm run load-data:docker
```

The script uses `/secret/boot/:category` and `/secret/feed-data/:category`. Set `ADMIN_KEY` in `.env` if overriding the default.

## Project Structure

```
src/
├── core/
│   ├── controllers/   # HTTP handlers
│   ├── db/            # Redis client, query, data indexing
│   ├── cache/         # Internal/external caching
│   ├── queue/         # Job processing
│   └── utils/         # Config, helpers, polyfills
├── middleware/        # Auth, throttle, analytics
├── routes/            # API routes
├── http.ts            # Express app entry
└── ws.ts              # WebSocket entry
```

## Docker

Copy `.env.example` to `.env` and run:

```bash
docker compose up -d
```

**Services:** Redis (words + auth), Node app, Nginx, Redis Insight.

**Redis Insight** at http://localhost:5540 – add databases:
- **redis_words** – Host: `redis_words`, Port: `6379`, Password: from `REDIS_PASSWORD`
- **redis_auth** – Host: `redis_auth`, Port: `6379`, Password: from `REDIS_PASSWORD`

## License

MIT
