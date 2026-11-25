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
npx nx run user-access:migrate-prisma
npx nx run jobs:migrate-prisma
npx nx run products:migrate-drizzle

# 5. Tạo apps/*/.env (không có .env.example), rồi chạy
npm start
```

Không commit `.env` — toàn bộ `apps/*/.env` đã bị gitignore.

## Biến môi trường

| App      | Biến bắt buộc                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| auth     | `PORT`, `AUTH_GRPC_SERVICE_URL`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, `KEYCLOAK_HOST`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET` (login + verify JWKS + Admin API tạo user); tùy chọn `SECURE_COOKIE`, `TCP_AUTH_PORT` (mặc định 3103), `TCP_USER_ACCESS_HOST` |
| user-access | `PORT`, `DATABASE_URL`, `TCP_HOST`, `TCP_USER_ACCESS_PORT` (mặc định 3104), `TCP_AUTH_HOST`; Keycloak gọi qua TCP auth nên không cần `KEYCLOAK_*` |
| jobs     | `PORT`, `DATABASE_URL`, `JOBS_GRPC_SERVICE_URL`, `AUTH_GRPC_SERVICE_URL`, `PULSAR_SERVICE_URL`                                                |
| executor | `PORT`, `JOBS_GRPC_SERVICE_URL`, `PRODUCTS_GRPC_SERVICE_URL`, `PULSAR_SERVICE_URL`                                                            |
| products | `PORT`, `DATABASE_URL`, `PRODUCTS_GRPC_SERVICE_URL`                                                                                           |
| bff      | `PORT`, `REDIS_HOST`, `REDIS_PORT`, `AUTH_GRPC_SERVICE_URL` (gRPC `Packages.AUTH` cho `UserGuard`); `BFF_GRPC_SERVICE_URL` hiện chưa dùng     |

`libs/configuration` còn đọc `NODE_ENV`, `IS_DEV`, `GLOBAL_PREFIX`. Luôn đọc qua `ConfigService.getOrThrow`, không hardcode.

## Port: local vs compose

| Service  | HTTP local        | HTTP compose          | gRPC local | gRPC compose |
| -------- | ----------------- | --------------------- | ---------- | ------------ |
| auth     | 3001              | 3000                  | 5000       | 5000         |
| user-access | 3005           | 3005                  | —          | —            |
| jobs     | 3004              | 3001                  | **5002**   | **5001**     |
| executor | 3002 (không dùng) | 3003                  | —          | —            |
| products | 3003              | 3002                  | **5001**   | **5002**     |
| bff      | 3000              | chưa có trong compose | —          | —            |

auth mở TCP `TCP_AUTH_PORT` (local `.env`: 3103) cho `authorizer.*`/`keycloak.*`; user-access mở TCP `TCP_USER_ACCESS_PORT` (3104) cho `role.*`/`user.*`. bff dùng `TCP_SERVICES.USER_ACCESS_SERVICE` cho roles/users và `TCP_SERVICES.AUTH_SERVICE` cho login/verify; auth gọi user-access qua TCP 3104, user-access gọi auth qua TCP 3103.

Port local lấy từ `apps/*/.env`; trong compose, service gọi nhau bằng hostname (`auth:5000`, `jobs:5001`, `products:5002`, `pulsar:6650`).

Infra: postgres `5432`, pulsar `6650`, redis `6379`, keycloak `8180` (auth dùng cho login/JWKS/admin tạo user; realm `Ecosystem`, client `ecosystem_app`).

## URL truy cập

| Mục                     | URL                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------- |
| jobs GraphQL / GraphiQL | `http://localhost:3004/jobs`                                                          |
| jobs upload JSON        | `POST http://localhost:3004/jobs/uploads/upload`                                      |
| bff Swagger             | `http://localhost:3000/doc`                                                           |
| bff health              | `http://localhost:3000/bff/health`                                                    |
| bff REST roles          | `http://localhost:3000/api/v1/roles`                                                  |
| bff REST users          | `http://localhost:3000/api/v1/users`                                                  |
| auth                    | gRPC `localhost:5000`; TCP `localhost:3103` (login/verify/keycloak); không có HTTP API hoạt động |
| user-access             | TCP `localhost:3104` (roles/users); HTTP 3005 không có route nghiệp vụ |
| products                | gRPC `localhost:5001`; không có HTTP API                                              |
| executor                | Không HTTP API                                                                        |
| Keycloak Admin console  | `http://localhost:8180` (admin `admin`/`admin`); realm `Ecosystem`, client `ecosystem_app` |

## Docker apps

- `docker-compose.apps.yaml` tạo DB qua `docker/init-db.sql`, có healthcheck cho postgres/pulsar/redis và entrypoint chạy migration.
- Có service `user-access` (PORT 3005, TCP 3104, chạy `prisma migrate deploy` trong entrypoint); auth không còn DATABASE_URL/migration.
- Không có service `bff`; bff hiện chỉ chạy local bằng `npm start` hoặc `nx serve bff`.
- Không có service `keycloak` trong compose apps; auth container cần `KEYCLOAK_HOST` trỏ tới Keycloak thật (local `http://localhost:8180`, trong mạng compose là `http://keycloak:8080` nếu thêm service).

## CI

`.github/workflows/ci.yml` chạy trên push `main` và mọi pull request:

- Node 22 + npm cache, cài protoc.
- `npm ci --legacy-peer-deps`, `nrwl/nx-set-shas`.
- `npx nx affected -t lint test build`.
- Bước build/push Docker lên AWS ECR đang được comment.
