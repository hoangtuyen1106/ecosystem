# Tác vụ thường gặp

## Thêm feature GraphQL (jobs)

1. Tạo module/resolver/service/dto/model trong `apps/jobs/src/app/`.
2. Dùng `GqlAuthGuard` từ `@ecosystem/graphql` cho query/mutation cần đăng nhập.
3. Cập nhật Prisma schema nếu cần (xem mục Prisma bên dưới).
4. Viết `*.spec.ts`, chạy `npx nx test jobs`.

`auth` hiện chưa mount `GraphQLModule`; nếu thêm GraphQL cho auth phải import module đó trong `apps/auth/src/app/app.module.ts` trước.

## Thay đổi database

### Prisma (auth, jobs)

```bash
# Sửa apps/<auth|jobs>/prisma/schema.prisma
npx nx run <auth|jobs>:migrate-prisma     # migrate dev, sinh migration + generate
npx nx run <auth|jobs>:generate-prisma   # nếu chỉ cần regenerate client
```

- Client generated nằm ở `apps/<service>/src/generated/prisma`, không sửa tay.
- Migration auth hiện lệch schema (serial/3 cột so với UUID/enums); tạo migration mới trước khi tin vào DB.

### Drizzle (products)

```bash
# Sửa apps/products/src/<feature>/schema.ts
npx nx run products:generate-drizzle     # sinh SQL trong apps/products/drizzle
npx nx run products:migrate-drizzle      # áp dụng migration
```

- Kiểm tra SQL sinh ra trước khi migrate; seed categories nằm trong `drizzle/0002_seed-categories.sql`.

## Sửa gRPC contract

1. Sửa proto trong `libs/grpc/src/lib/proto/*.proto`.
2. `npx nx run grpc:generate-ts-proto` — target này sinh types vào `libs/grpc/src/lib/types/proto` (commit kết quả).
3. Cập nhật controller (`@*ServiceControllerMethods`) và client (`getService`) tương ứng.
4. `npx nx affected -t build` để kiểm tra `protoPath` trong `dist`.

## Thêm job end-to-end

1. Thêm tên job vào enum `Jobs` — `libs/nestjs/src/lib/jobs.ts`.
2. Thêm message class kế thừa `JobMessage` — `libs/pulsar/src/lib/messages/`, export trong `index.ts`.
3. Thêm job class trong `apps/jobs/src/app/jobs/<name>/` kế thừa `AbstractJob`, gắn decorator `@Job({ name: Jobs.<NAME>, description })`, khai báo trong module jobs.
4. Thêm consumer trong `apps/executor/src/app/jobs/<name>/` kế thừa `JobConsumer`, cài đặt `execute`, khai báo provider/module và gRPC client nếu cần.
5. Topic chính là tên job; ack tự động qua `JobsService.Acknowledge` trong `JobConsumer`.

## Thêm thư viện dùng chung

```bash
npx nx g @nx/node:lib <name>
```

Sau đó:

- Export API trong `libs/<name>/src/index.ts`.
- Thêm alias `@ecosystem/<name>` vào `tsconfig.base.json`.
- Thêm `_moduleAliases` tương ứng trỏ `dist/libs/<name>/main` trong root `package.json` (bắt buộc cho runtime dist).
- Nếu lib có webpack build, dùng `webpack.lib.config.js` như các lib hiện có.

## Thêm app mới

1. Generate app, gọi `init(app, '<prefix>')` trong `main.ts` và thêm `require('module-alias/register')`.
2. Thêm Dockerfile/entrypoint nếu cần deploy.
3. Thêm vào script `start` trong `package.json`, `docker-compose.apps.yaml`, biến `.env` và tài liệu port.
4. CI tự nhận qua `nx affected`.

## Thêm biến môi trường / đổi port

1. Thêm vào `apps/*/.env` (local) và `docker-compose.apps.yaml` (container).
2. Đọc bằng `ConfigService.getOrThrow('<KEY>')`.
3. Cập nhật bảng port tại [`architecture.md`](architecture.md) và [`environment-setup.md`](environment-setup.md).
4. Nếu là port HTTP mới, cập nhật `npm stop` trong root `package.json`.

## Kiểm tra trước khi hoàn tất

```bash
npx nx affected -t lint test build
```

Với thay đổi Prisma/Drizzle, chạy thêm migration local và kiểm tra service khởi động được bằng `npx nx serve <app>`.
