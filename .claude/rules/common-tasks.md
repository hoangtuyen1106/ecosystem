# Tác vụ thường gặp

## Thêm feature GraphQL (jobs)

1. Tạo module/resolver/service/dto/model trong `apps/jobs/src/app/`.
2. Dùng `GqlAuthGuard` từ `@ecosystem/graphql` cho query/mutation cần đăng nhập.
3. Cập nhật Prisma schema nếu cần (xem mục Prisma bên dưới).
4. Viết `*.spec.ts`, chạy `npx nx test jobs`.

`auth` hiện chưa mount `GraphQLModule`; nếu thêm GraphQL cho auth phải import module đó trong `apps/auth/src/app/app.module.ts` trước.

## Thay đổi database

### Prisma (user-access, jobs)

```bash
# Sửa apps/<user-access|jobs>/prisma/schema.prisma
npx nx run <user-access|jobs>:migrate-prisma     # migrate dev, sinh migration + generate
npx nx run <user-access|jobs>:generate-prisma    # nếu chỉ cần regenerate client
```

- Client generated nằm ở `apps/<service>/src/generated/prisma`, không sửa tay.
- `prisma.config.ts` đọc `DATABASE_URL` qua `env()` (không còn fallback URL giả) — phải set biến trước khi migrate.
- Đặt tên migration rõ nghĩa: `npx nx run user-access:migrate-prisma --name=<mo_ta>`; migration được tạo trong `apps/user-access/prisma/migrations/<timestamp>_<name>/`.
- Migration auth cũ đã chuyển sang `apps/user-access/prisma/migrations` (gần nhất `20261118184004_role_author`). DB local dùng database `auth` đã apply.
- `auth` không còn Prisma/DB; chỉ `user-access` sở hữu schema User/Role/UserRole.

### Drizzle (products)

```bash
# Sửa apps/products/src/<feature>/schema.ts
npx nx run products:generate-drizzle     # sinh SQL trong apps/products/drizzle
npx nx run products:migrate-drizzle      # áp dụng migration
```

- Kiểm tra SQL sinh ra trước khi migrate; seed categories nằm trong `drizzle/0002_seed-categories.sql`.

## Thay đổi feature Role (user-access TCP + bff REST)

1. Thêm message vào enum `ROLE` — `libs/constants/src/lib/enum/tcp-request-message.enum.ts`; nếu thêm quyền mới thì bổ sung `PERMISSION` trong `libs/constants/src/lib/enum/role.enum.ts`.
2. Thêm DTO/interface: `libs/interfaces/src/lib/gateway/role/role.request.dto.ts`, `libs/interfaces/src/lib/tcp/role/role.request.interface.ts` (và response nếu hình dạng trả về đổi).
3. user-access: `apps/user-access/src/role/role.repository.ts` → `role.service.ts` → `@MessagePattern` trong `role.controller.ts`.
4. bff: `roles.service.ts` (gửi TCP + `formatResponseDates`) → `roles.controller.ts` (`@Authorization({ secured: true })`, `ParseIntPipe`, Swagger).
5. Test: `npx nx test auth`; viết thêm spec bff trong `roles.service.spec.ts`.
6. Kiểm tra: `npx nx affected -t lint test build`.

Quy ước hiện tại:

- `update` chỉ cho sửa `name`, `description`, `permissions`; đổi trạng thái phải qua `role.change_status` / `PATCH /roles/:id/status` body `{ status: ROLE_STATUS }`.
- `remove` là hard delete, xoá `user_roles` liên quan trong cùng transaction.
- TCP controller **không** chạy `class-validator`; validation nằm ở DTO bff, service check tồn tại/trùng tên.
- Thêm trạng thái mới: sửa `enum RoleStatus` trong `schema.prisma` (member **chữ thường**) **và** `ROLE_STATUS` trong `libs/constants/src/lib/enum/role.enum.ts`; chạy `npx nx run user-access:generate-prisma`.
- FK người tạo là `authorId` (nullable) → relation `author`; response trả `authorId` + `authorName`.
- Lọc theo trạng thái: `status` là mảng, repository dùng `{ in: status }`.

## Thay đổi feature User (user-access TCP + bff REST)

Pattern giống Role, khác biệt chính: `User.id` là **UUID string**, xoá là **soft delete**, response đọc kèm role.

1. Thêm message vào enum `USER` — `libs/constants/src/lib/enum/tcp-request-message.enum.ts`; nếu thêm trạng thái mới thì bổ sung `USER_STATUS`/`USER_GENDER` trong `libs/constants/src/lib/enum/user.enum.ts`.
2. Thêm DTO/interface: `libs/interfaces/src/lib/gateway/user/user.request.dto.ts`, `libs/interfaces/src/lib/tcp/user/user.request.interface.ts` (và response nếu hình dạng trả về đổi).
3. user-access: `apps/user-access/src/user/user.repository.ts` → `users.service.ts` → `@MessagePattern` trong `users.controller.ts`.
4. bff: `users.service.ts` (gửi TCP + `formatResponseDates`) → `users.controller.ts` (`@Authorization({ secured: true })`, Swagger).
5. Test: `npx nx test auth`, `npx nx test bff`.
6. Kiểm tra: `npx nx run-many -t lint test build -p auth bff`.

Quy ước hiện tại:

- `id` luôn là **string UUID**: dùng `@Param('id') id: string` (không `ParseIntPipe`) và `UuidCursorPaginationDto` cho cursor.
- `PATCH /users/:id` chỉ sửa `username/email/firstName/lastName/avatar/phone/birthday/gender`; đổi trạng thái qua `PATCH /users/:id/status`; đổi password phải có endpoint riêng.
- `remove` là **soft delete**: `update({ deleted: true })`, không xoá `user_roles`; `buildWhere` luôn có `deleted: false`.
- Response trả `roleIds`/`roleNames` bằng include `user_roles → role`; chưa có API gán role.
- `email`/`username` không unique trong schema → dùng `findFirst`; service check trùng email khi create và khi update (`excludeId`).
- `searchUnicode` ghi từ `username/email/firstName/lastName/phone` bằng `StringUtil.toSearchKey`, lọc `search` bằng `StringUtil.formatUnicode(search, { lowercase: true })`.
- Enum Prisma member **chữ thường**; không dùng `toUpperCase()` khi ghi `gender`/`status`.

## Xử lý lỗi khi gọi Keycloak (luồng tạo user)

Luồng: `bff POST /users` → TCP `user.create` → `UsersService.create` → TCP `keycloak.create_user` (auth 3103) → Keycloak Admin API → Prisma. Keycloak tạo **trước** DB nên cần chống orphan.

Khi thêm/sửa lỗi Keycloak:

1. Map lỗi ngay trong `apps/auth/src/app/keycloak/keycloak-http.service.ts` (không để `AxiosError` thoát ra):
   - 409 `User exists with same email/username` → `ConflictException` + `ERROR_CODE.USER_ALREADY_EXISTS`.
   - 400 password policy / invalid user representation → `BadRequestException` (code `PASSWORD_POLICY_VIOLATION` / `INVALID_USER_DATA`).
   - 401/403/404 → lỗi cấu hình server (500), log `errorMessage`.
   - 429 → 503 + `Retry-After`; 5xx/`ECONNREFUSED`/`ETIMEDOUT` → 502/503 `KEYCLOAK_UNAVAILABLE`.
   - Luôn log `status` + `errorMessage` gốc; client chỉ nhận code sạch.
2. Bổ sung `ERROR_CODE` Keycloak vào `libs/constants/src/lib/enum/error-code.enum.ts`.
3. Đảm bảo lỗi qua TCP giữ được status: `KeycloakController` đã gắn `TcpLoggingInterceptor`; interceptor phải xuất `statusCode` dạng **number** (không dùng `AxiosError.code` như `ERR_BAD_REQUEST`).
4. Chống orphan trong `UsersService.create`: validate `roleIds` **trước** khi gọi Keycloak; nếu ghi DB fail thì gọi message `keycloak.delete_user` để xoá bù; compensation fail thì log `keycloakId` và trả lỗi nêu rõ.
5. Cấu hình HTTP client: `timeout: 5000`; cache admin token tới `expires_in − 30s`; chỉ retry exchange token (idempotent).
6. Test: mock axios cho 409/400/401/403/429/timeout/5xx; test DB fail → có gọi delete bù; `npx nx test auth` + `npx nx test bff`.

Chẩn đoán nhanh (admin token, tìm/xoá user orphan): xem [`troubleshooting.md`](troubleshooting.md) mục Keycloak.

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
