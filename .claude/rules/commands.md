# Lệnh phát triển

Chạy Nx qua npm để dùng đúng version trong workspace: `npx nx ...`.

## Khởi động

```bash
# Chạy 5 app song song: auth 3000, jobs 3001, executor 3002, products 3003, bff 3004
npm start

# Dừng service (chỉ kill 3000-3003)
npm stop

# bff không nằm trong npm stop
lsof -ti :3004 | xargs kill -9

# Infra: postgres 5432, pulsar 6650, redis 6379, keycloak 8180
npm run docker:infra

# Apps trong Docker (không gồm bff)
npm run docker:apps
npm run docker:apps:down
docker compose -f docker-compose.apps.yaml logs -f <service>
```

## Serve / build

```bash
npx nx serve auth        # jobs | executor | products | bff
npx nx build bff
npx nx run-many -t build -p auth jobs executor products bff
npx nx affected -t build
npx nx show project auth     # xem targets của một project
npx nx show projects
```

## Test / lint / format

```bash
npx nx test auth             # --watch để chạy watch mode
npx nx run-many -t test
npx nx affected -t test
npx nx lint auth
npx nx affected -t lint
npx prettier --write .
```

## Database và code generation

```bash
# Prisma - auth/jobs (migrate dev cho local)
npx nx run auth:generate-prisma
npx nx run auth:migrate-prisma
npx nx run jobs:generate-prisma
npx nx run jobs:migrate-prisma

# Drizzle - products
npx nx run products:generate-drizzle
npx nx run products:migrate-drizzle

# Sinh lại gRPC types từ proto (build của grpc tự chạy target này)
npx nx run grpc:generate-ts-proto
```

Container dùng `prisma migrate deploy` (auth/jobs) và `drizzle-kit migrate` (products) trong entrypoint.

## Nx utilities

```bash
npx nx graph
npx nx reset                  # xóa cache khi build/test có kết quả lạ
npx nx run-many -t lint test build -p auth jobs products executor bff
```

## Tra nhanh

| Muốn làm                         | Lệnh                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| Chạy toàn bộ app                 | `npm start`                                                  |
| Chạy 1 app                       | `npx nx serve <app>`                                         |
| Kiểm tra thay đổi trước khi push | `npx nx affected -t lint test build`                         |
| Đổi schema auth/jobs             | `npx nx run <auth\|jobs>:migrate-prisma`                     |
| Đổi schema products              | `npx nx run products:generate-drizzle` rồi `migrate-drizzle` |
| Đổi proto                        | `npx nx run grpc:generate-ts-proto`                          |
| Xem port/target                  | `npx nx show project <project>`                              |

Port canonical và trạng thái local/compose: xem [`environment-setup.md`](environment-setup.md).
