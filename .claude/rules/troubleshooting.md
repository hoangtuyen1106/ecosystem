# Khắc phục sự cố

## Known issues (đã xác minh trong code)

| Hiện tượng                            | Trạng thái                                                                                   | Xử lý tạm                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| auth không có endpoint GraphQL        | `AuthResolver` tồn tại nhưng `app.module.ts` chưa import `GraphQLModule`                     | Thêm `GraphQLModule` hoặc dùng gRPC `Authenticate`                      |
| Migration auth lệch schema            | Migration tạo `User(id serial, email, password)`; schema dùng UUID + enums, `@@map("users")` | Tạo migration mới trước khi dùng DB                                     |
| `npm stop` không dừng bff             | Script chỉ kill port 3000–3003                                                               | `lsof -ti :3004 \| xargs kill -9`                                       |
| bff không có trong Docker             | Thiếu service trong `docker-compose.apps.yaml` dù có Dockerfile                              | Chạy local bằng `nx serve bff`                                          |
| Port lệch local ↔ compose            | jobs gRPC 5002/5001; products HTTP 3003/3002, gRPC 5001/5002                                 | Luôn đọc `apps/*/.env` hoặc compose, không hardcode                     |
| `docker:infra` không tạo DB nghiệp vụ | Compose infra không mount `docker/init-db.sql`                                               | `docker compose exec -T postgres psql -U postgres < docker/init-db.sql` |
| `scripts/fibonacci.mjs` dùng URL cũ   | Gọi `/graphql`; jobs GraphQL thực tế ở `/jobs`, auth chưa mount GraphQL                      | Sửa URL trước khi dùng làm smoke test                                   |
| `UsersModule` thiếu provider          | `UsersService` inject `UserRepository` nhưng module không khai báo provider                  | Thêm `UserRepository` vào `providers`/`exports`                         |

## Prisma (auth, jobs)

- Lỗi missing generated types → `npx nx run <service>:generate-prisma`.
- `DATABASE_URL` sai/thiếu → kiểm tra `apps/<service>/.env`; Prisma 7 dùng `PrismaPg` + `pg.Pool`.
- DB chưa tồn tại → tạo bằng `docker/init-db.sql` hoặc `docker compose exec postgres psql -U postgres -c 'CREATE DATABASE auth;'`.
- Migration drift → xem known issues; chạy `npx nx run <service>:migrate-prisma` để sinh migration mới.

## Drizzle (products)

- `DATABASE_URL` thiếu → `drizzle.config.ts` đọc biến này trực tiếp.
- Chưa có SQL migration → chạy `npx nx run products:generate-drizzle` trước `migrate-drizzle`.
- Bảng `categories` trống → áp dụng migration seed `apps/products/drizzle/0002_seed-categories.sql`.

## gRPC

- `protoc --version` phải chạy được; CI cài bằng `arduino/setup-protoc`.
- Sửa proto nhưng type không đổi → `npx nx run grpc:generate-ts-proto` rồi rebuild.
- Sai port/URL → đối chiếu `*_GRPC_SERVICE_URL` với bảng ở [`environment-setup.md`](environment-setup.md); nhớ jobs/products bị hoán đổi port giữa local và compose.
- `protoPath` phải trỏ tới `dist/libs/grpc/proto/...` vì build copy proto vào `dist`.
- Sai `package`/service name → dùng `Packages` và `*_SERVICE_NAME` từ `@ecosystem/grpc`.
- `auth.proto` khai báo `User.id` là `int32` nhưng entity Prisma dùng UUID string — cần đồng bộ khi triển khai thật.

## GraphQL / auth

- jobs GraphQL ở `http://localhost:3001/jobs`, không phải `/graphql`.
- Guard trả `false` → thiếu cookie `Authentication` hoặc auth service/gRPC không truy cập được.
- auth không có endpoint GraphQL → xem known issues.

## Pulsar

- Kiểm tra `PULSAR_SERVICE_URL` (local `pulsar://localhost:6650`, compose `pulsar://pulsar:6650`).
- Topic không khớp → topic là tên job trong enum `Jobs`; consumer dùng subscription `ecosystem`.
- Message sai schema → message class phải kế thừa `JobMessage` và có decorator `class-validator`.
- Job không đóng → kiểm tra executor gọi được `JobsService.Acknowledge`.

## Port conflict

```bash
lsof -ti :<port>
lsof -ti :<port> | xargs kill -9
```

Kiểm tra cả port HTTP và gRPC; bff 3004 không nằm trong `npm stop`.

## Module alias

- `main.ts` phải có `require('module-alias/register')` ở dòng đầu.
- Alias phải đồng thời có trong `tsconfig.base.json` và `_moduleAliases` (root `package.json`).
- `_moduleAliases` trỏ tới `dist/libs/<name>/main`; rebuild lib sau khi sửa.

## Redis / bff

- `ThrottlerProvider` dùng `getOrThrow('REDIS_HOST')` và `getOrThrow('REDIS_PORT')`; thiếu biến sẽ fail ngay khi khởi động.
- Kiểm tra Redis: `docker compose ps redis` hoặc `redis-cli ping`.

## Nx cache

```bash
npx nx reset
npx nx affected -t lint test build
```

Dùng `--skip-nx-cache` khi cần chạy lại một task cụ thể.
