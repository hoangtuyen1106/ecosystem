# Thiết lập môi trường

## Yêu cầu

- Node.js 22+, npm 10+
- Protoc (bắt buộc để build `libs/grpc`; CI cài qua `arduino/setup-protoc`)
- Docker & Docker Compose

## Setup local

```bash
# 1. Dependencies (bắt buộc --legacy-peer-deps)
npm ci --legacy-peer-deps

# 2. Infra: postgres, pulsar, redis, keycloak
npm run docker:infra

# 3. Tạo DB nghiệp vụ (docker:infra KHÔNG mount init-db.sql)
docker compose exec -T postgres psql -U postgres < docker/init-db.sql

# 4. Migrations
npx nx run auth:migrate-prisma
npx nx run jobs:migrate-prisma
npx nx run products:migrate-drizzle

# 5. Tạo apps/*/.env (không có .env.example), rồi chạy
npm start
```

Không commit `.env` — toàn bộ `apps/*/.env` đã bị gitignore.

## Biến môi trường

| App      | Biến bắt buộc                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| auth     | `PORT`, `DATABASE_URL`, `AUTH_GRPC_SERVICE_URL`, `JWT_SECRET`, `JWT_EXPIRATION_MS`; tùy chọn `SECURE_COOKIE` |
| jobs     | `PORT`, `DATABASE_URL`, `JOBS_GRPC_SERVICE_URL`, `AUTH_GRPC_SERVICE_URL`, `PULSAR_SERVICE_URL`               |
| executor | `PORT`, `JOBS_GRPC_SERVICE_URL`, `PRODUCTS_GRPC_SERVICE_URL`, `PULSAR_SERVICE_URL`                           |
| products | `PORT`, `DATABASE_URL`, `PRODUCTS_GRPC_SERVICE_URL`                                                          |
| bff      | `PORT`, `REDIS_HOST`, `REDIS_PORT`; `BFF_GRPC_SERVICE_URL` hiện chưa dùng (code comment)                     |

`libs/configuration` còn đọc `NODE_ENV`, `IS_DEV`, `GLOBAL_PREFIX`. Luôn đọc qua `ConfigService.getOrThrow`, không hardcode.

## Port: local vs compose

| Service  | HTTP local        | HTTP compose          | gRPC local | gRPC compose |
| -------- | ----------------- | --------------------- | ---------- | ------------ |
| auth     | 3000              | 3000                  | 5000       | 5000         |
| jobs     | 3001              | 3001                  | **5002**   | **5001**     |
| executor | 3002 (không dùng) | 3003                  | —          | —            |
| products | 3003              | 3002                  | **5001**   | **5002**     |
| bff      | 3004              | chưa có trong compose | —          | —            |

Port local lấy từ `apps/*/.env`; trong compose, service gọi nhau bằng hostname (`auth:5000`, `jobs:5001`, `products:5002`, `pulsar:6650`).

Infra: postgres `5432`, pulsar `6650`, redis `6379`, keycloak `8180` (chưa dùng trong code).

## URL truy cập

| Mục                     | URL                                                |
| ----------------------- | -------------------------------------------------- |
| jobs GraphQL / GraphiQL | `http://localhost:3001/jobs`                       |
| jobs upload JSON        | `POST http://localhost:3001/jobs/uploads/upload`   |
| bff Swagger             | `http://localhost:3004/doc`                        |
| bff health              | `http://localhost:3004/bff/health`                 |
| auth                    | gRPC `localhost:5000`; không có HTTP API hoạt động |
| products                | gRPC `localhost:5001`; không có HTTP API           |
| executor                | Không HTTP API                                     |

## Docker apps

- `docker-compose.apps.yaml` tạo DB qua `docker/init-db.sql`, có healthcheck cho postgres/pulsar/redis và entrypoint chạy migration.
- Không có service `bff`; bff hiện chỉ chạy local bằng `npm start` hoặc `nx serve bff`.

## CI

`.github/workflows/ci.yml` chạy trên push `main` và mọi pull request:

- Node 22 + npm cache, cài protoc.
- `npm ci --legacy-peer-deps`, `nrwl/nx-set-shas`.
- `npx nx affected -t lint test build`.
- Bước build/push Docker lên AWS ECR đang được comment.
