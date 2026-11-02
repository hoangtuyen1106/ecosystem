---
paths:
  - 'apps/**'
  - 'libs/**'
  - 'docker-compose*.yaml'
  - 'docker/**'
  - 'nx.json'
  - 'package.json'
  - 'tsconfig.base.json'
  - '.github/workflows/*.yml'
---

# Tổng quan kiến trúc

Workspace **Ecosystem**: Nx 23.0.1 + npm workspaces, NestJS 11, Node 22. Giao tiếp gồm GraphQL (chỉ jobs), gRPC giữa các service, Pulsar cho xử lý bất đồng bộ, Redis cho throttler/cache.

## Ứng dụng

| App        | HTTP local                                 | API                                                                | gRPC local                                                  | Dữ liệu                     | Vai trò                                    |
| ---------- | ------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------- | ------------------------------------------ |
| `auth`     | 3000 (prefix `auth`)                       | Không có route HTTP đang hoạt động; resolver login chưa được mount | `AuthService.Authenticate` — 5000                           | Prisma/Postgres `auth`      | Đăng nhập, JWT cookie, quản lý user        |
| `jobs`     | 3001 (prefix `jobs`)                       | GraphQL `/jobs`; `POST /jobs/uploads/upload`                       | `JobsService.Acknowledge` — 5002                            | Prisma/Postgres `jobs`      | Nhận lệnh job, upload JSON, publish Pulsar |
| `executor` | Không HTTP API hữu dụng (PORT theo `.env`) | Không GraphQL                                                      | Client tới jobs/products                                    | Không DB                    | Consumer Pulsar, thực thi job              |
| `products` | 3003 local / 3002 compose (prefix `api`)   | Không có controller HTTP                                           | `ProductsService.CreateProduct` — 5001 local / 5002 compose | Drizzle/Postgres `products` | Tạo/lưu sản phẩm                           |
| `bff`      | 3004 (prefix `bff`)                        | `GET /bff/health`; Swagger `/doc`                                  | Code gRPC đang comment                                      | Không DB                    | API gateway REST, health check, throttler  |

Cột port ở trên là canonical. Local lấy từ `apps/*/.env`, container lấy từ `docker-compose.apps.yaml`; xem [`environment-setup.md`](environment-setup.md) khi cần bảng đối chiếu.

## Thư viện dùng chung

| Lib                        | Nội dung chính                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `@ecosystem/grpc`          | Proto (`src/lib/proto`), types sinh tự động (`src/lib/types/proto`, đã commit), `Packages`, `GrpcLoggingInterceptor` |
| `@ecosystem/graphql`       | `GqlAuthGuard` (gọi auth qua gRPC), `GqlLoggingPlugin`, `GqlContext`, `AbstractModel`                                |
| `@ecosystem/nestjs`        | `init()`, `LoggerModule` (pino), enum `Jobs`                                                                         |
| `@ecosystem/pulsar`        | `PulsarClient`, `PulsarConsumer`, message classes, serialize/deserialize JSON                                        |
| `@ecosystem/configuration` | `AppConfiguration` (`PORT`, mặc định 3300), `BaseConfiguration` + `validate()`, `ThrottlerProvider` dùng Redis       |
| `@ecosystem/redis`         | `RedisModule`, `RedisService` bọc `ioredis`                                                                          |
| `@ecosystem/prisma`        | Placeholder — `src/index.ts` chưa export gì                                                                          |

Import qua alias `@ecosystem/*` (xem `tsconfig.base.json`). `main.ts` phải bắt đầu bằng `require('module-alias/register')` để bản build trong `dist` resolve được alias.

## Giao tiếp

### GraphQL

- Chỉ `jobs` dùng Apollo: `autoSchemaFile: true`, GraphiQL bật, path `jobs`, plugin `GqlLoggingPlugin`.
- `auth` có `AuthResolver` nhưng `apps/auth/src/app/app.module.ts` **chưa import `GraphQLModule`**, nên chưa có endpoint GraphQL.
- `products` và `executor` không dùng GraphQL.

### gRPC

- Proto đặt tại `libs/grpc/src/lib/proto/*.proto`; types TS sinh bằng `nx run grpc:generate-ts-proto` và được commit.
- Client đăng ký qua `ClientsModule.registerAsync`, URL lấy từ `*_GRPC_SERVICE_URL`; `protoPath` trỏ tới `dist/libs/grpc/proto`.
- `GqlAuthGuard` đọc cookie `Authentication`, gọi `AuthService.Authenticate`; user trả về được gắn vào `req.user`.

### Pulsar

- Topic = tên job trong enum `Jobs` (`Fibonacci`, `LoadProducts`).
- `jobs` là producer: `AbstractJob.execute` tạo bản ghi `Job` rồi publish từng message; `executor` là consumer với subscription `ecosystem`, kiểu `Shared`.
- Message class nằm trong `libs/pulsar/src/lib/messages`; dữ liệu được validate bằng `class-validator` trước khi gửi.

### Luồng job end-to-end

1. Client đăng nhập, nhận cookie `Authentication`.
2. Gọi mutation `executeJob` tại jobs GraphQL (guard xác thực qua auth gRPC).
3. jobs tạo bản ghi `Job` (`IN_PROGRESS`) và publish message lên Pulsar.
4. executor consume, xử lý (`Fibonacci` hoặc `LoadProducts` → gọi products gRPC).
5. executor gọi `JobsService.Acknowledge`; jobs tăng `completed` và đóng job khi đủ `size`.

## Dữ liệu

- **Prisma 7** (auth, jobs): generator `prisma-client`, output `apps/*/src/generated/prisma`, `moduleFormat = "cjs"`; runtime dùng `PrismaPg` + `pg.Pool` từ `DATABASE_URL`. Không sửa tay thư mục generated. Mỗi service có migration riêng.
- **Drizzle** (products): `drizzle-orm` + `drizzle-kit`; kết nối qua token `DATABASE_CONNECTION`, schema đặt cạnh feature (`src/**/schema.ts`), migration trong `apps/products/drizzle`.
- **Redis**: storage cho `ThrottlerProvider` (bff) và `RedisService` dùng chung.
- **Keycloak** có trong `docker-compose.yaml` nhưng chưa được code sử dụng.

## Cross-cutting

- `init(app, globalPrefix = 'api')` trong `@ecosystem/nestjs` bật `ValidationPipe({ whitelist: true })`, `setGlobalPrefix`, pino logger, `cookieParser`, rồi listen `PORT` (bắt buộc, `getOrThrow`).
- Prefix từng app: `auth`, `jobs`, `bff`, `api` (products, executor).
- `libs/configuration` đọc env trong constructor + `validateSync`; bff có thêm `apps/bff/src/configuration/index.ts` (scaffold, gọi `CONFIGURATION.validate()`).
- Swagger chỉ bật ở bff (`/doc`, bearer JWT); CORS `origin: '*'`.

## Docker

- `docker-compose.yaml` (infra): postgres:16, pulsar standalone, redis, keycloak 8180.
- `docker-compose.apps.yaml`: postgres (mount `docker/init-db.sql` tạo DB `auth`, `jobs`, `products`), pulsar, redis, auth, jobs, executor, products. **Không có bff.**
- Entrypoint: auth/jobs chạy `prisma migrate deploy`; products chạy `drizzle-kit migrate`; bff chỉ start.

## Liên quan

- Hiện trạng lệch/bug đã biết: [`troubleshooting.md`](troubleshooting.md).
- Quy trình thêm feature/job/proto: [`common-tasks.md`](common-tasks.md).
