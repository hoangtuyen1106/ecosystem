# Khắc phục sự cố

## Known issues (đã xác minh trong code)

| Hiện tượng                                        | Trạng thái                                                                                       | Xử lý tạm                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| auth không có endpoint GraphQL                    | `AuthResolver` tồn tại nhưng `app.module.ts` chưa import `GraphQLModule`                         | Thêm `GraphQLModule` hoặc dùng gRPC `Authenticate`                              |
| `bff:test` fail "unexpected token"                | Đã xử lý: bff không còn import `uuid`; `user-access` có `transformIgnorePatterns` cho `uuid`      | Nếu tái xuất hiện, thêm `uuid` vào `transformIgnorePatterns` của jest config app tương ứng |
| Auth verify token trả 401 dù token đúng           | Auth gọi TCP `user.get_by_keycloak_id` tới user-access (3104)                                     | Kiểm tra user-access đang chạy + `TCP_USER_ACCESS_HOST`/port 3104                              |
| `authorId` của role luôn là UUID giả              | `role.repository.create()` hardcode `00000000-0000-0000-0000-000000000001`                       | Cần truyền user id thật từ request context qua TCP; cột nullable để chấp nhận dữ liệu cũ |
| `PATCH /roles/:id` gửi `status` không có tác dụng | DTO/`UpdateRoleData` đã bỏ `status` (by design)                                                  | Dùng `PATCH /roles/:id/status` body `{ status: 'active' \| 'inactive' }`        |
| API cũ dùng `active`/`createdBy`                  | Đã đổi thành `status` (enum) và `authorId`/`authorName`                                          | Client cũ gửi `active` bị `whitelist` loại bỏ; cập nhật client                  |
| Type lỗi `ROLE_STATUS[]` not assignable `RoleStatus[]` | Prisma sinh enum theo **tên member**; nếu member viết hoa thì client là `'ACTIVE'`             | Đặt member enum chữ thường trong `schema.prisma` rồi `generate-prisma`          |
| `prisma migrate dev` báo "cannot be executed" khi thêm cột NOT NULL | Bảng có dữ liệu cũ (vd `roles` 11 dòng, `author_id` rỗng, `users` trống)                       | Cho cột nullable, hoặc `--create-only` rồi viết tay `RENAME COLUMN`/backfill; áp SQL bằng `psql` và `prisma migrate resolve --applied` |
| `nx build` fail ở `libs/utils/.../vn-date.util.ts` (TS4111) | `libs/decorators` build strict `noPropertyAccessFromIndexSignature` khi kéo file utils       | Không dùng `Record<string, ...>` rồi truy cập `.key`; dùng object literal có key cố định |
| Xoá role bị lỗi FK `user_roles`                   | FK `user_roles.role_id` là `ON DELETE RESTRICT`                                                  | Repository đã `deleteMany` `user_roles` trong transaction trước khi xoá role    |
| bff trả 200 dù không gửi token                    | Kiểm tra route có `@Authorization({ secured: true })` và `UserGuard` là `APP_GUARD`              | `UserGuard` đã đăng ký trong `apps/bff/src/app/app.module.ts`                   |
| `npm stop` không dừng jobs                        | Script chỉ kill port 3000–3003 (bff/auth/executor/products); jobs ở 3004                         | `lsof -ti :3004 \| xargs kill -9`                                               |
| bff không có trong Docker                         | Thiếu service trong `docker-compose.apps.yaml` dù có Dockerfile                                  | Chạy local bằng `nx serve bff`                                                  |
| Port lệch local ↔ compose                        | jobs HTTP 3004 (compose 3001), gRPC 5002/5001; products HTTP 3003/3002, gRPC 5001/5002           | Luôn đọc `apps/*/.env` hoặc compose, không hardcode                             |
| `docker:infra` không tạo DB nghiệp vụ             | Compose infra không mount `docker/init-db.sql`                                                   | `docker compose exec -T postgres psql -U postgres < docker/init-db.sql`         |
| `scripts/fibonacci.mjs` dùng URL cũ               | Gọi `/graphql`; jobs GraphQL thực tế ở `/jobs`, auth chưa mount GraphQL                          | Sửa URL trước khi dùng làm smoke test                                           |
| `POST /users/create` trả 404                      | Route cũ đã đổi thành `POST /users` (chuẩn REST như `/roles`)                                    | Cập nhật client sang `POST /api/v1/users`                                       |
| `GET /users/:id` trả 404 dù user từng tồn tại      | `DELETE /users/:id` là **soft delete** (`deleted = true`); list/findOne lọc `deleted = false`     | Đây là hành vi đúng; muốn xem lại phải khôi phục `deleted = false` trong DB     |
| Cursor user lỗi/không phân trang đúng              | `users.id` là UUID string, không dùng `CursorPaginationDto` (`cursor: number`)                    | Dùng `UuidCursorPaginationDto`; cursor chỉ chính xác khi `sortBy=id`            |
| `gender`/`status` user lưu sai giá trị             | Code cũ gọi `.toUpperCase()` trong khi Prisma enum đã là chữ thường (`male`, `active`)            | Không dùng `toUpperCase()`; truyền thẳng giá trị `USER_GENDER`/`USER_STATUS`    |
| Update/delete user không đổi bên Keycloak          | Chỉ `create` gọi Keycloak; update/delete hiện chỉ sửa DB                                          | Cần bổ sung đồng bộ Keycloak khi triển khai thật                                |
| Tạo user báo email trùng dù DB không unique        | `email` không còn `@unique`; service check trùng bằng `findFirst` (create + update loại trừ self) | Đây là validate nghiệp vụ; nếu cần chặn tuyệt đối phải thêm unique index/DB     |
| `POST /users` trả 500 "Internal server error" dù Keycloak trả 409 | Chuỗi lỗi: `AxiosError` 409 → `tcpLogging.interceptor` lấy `error.code = 'ERR_BAD_REQUEST'` (string) → `ExceptionInterceptor` dùng làm HTTP status → mất message. `KeycloakController` đã gắn `TcpLoggingInterceptor` nhưng chưa sửa logic lấy status | Sửa Phase 2 (status number) trong `CLAUDE.md` mục Keycloak. Tạm thời kiểm tra Keycloak trực tiếp (mục Keycloak bên dưới) |
| User tồn tại bên Keycloak nhưng DB `users` không có (orphan) | Keycloak tạo trước, validate `roleIds`/ghi DB sau (`UsersService.create` → `user.repository.create`); lỗi DB để lại user mồ côi, retry tiếp theo nhận 409 | Xoá user orphan trong Keycloak rồi tạo lại, hoặc thêm compensation `keycloak.delete_user` (Phase 3) |
| `keycloak.create_user` treo lâu / token admin hết hạn giữa chừng | Axios không đặt timeout; mỗi lần tạo user exchange client token mới, không cache | Thêm `timeout` + cache token theo `expires_in − 30s` (Phase 1) |

## Prisma (user-access, jobs)

- `auth` không còn Prisma/DB; mọi lỗi user/role Prisma kiểm tra `apps/user-access`.
- Lỗi missing generated types → `npx nx run <service>:generate-prisma`.
- `DATABASE_URL` sai/thiếu → kiểm tra `apps/user-access/.env` (đang trỏ DB `auth` để giữ dữ liệu); Prisma 7 dùng `PrismaPg` + `pg.Pool`.
- `prisma.config.ts` (user-access) dùng `env('DATABASE_URL')` — không còn fallback; migrate sẽ fail nếu thiếu biến.
- DB chưa tồn tại → tạo bằng `docker/init-db.sql` hoặc `docker compose exec postgres psql -U postgres -c 'CREATE DATABASE auth;'`.
- Migration drift → chạy `npx nx run <service>:migrate-prisma --name=<mo_ta>` để sinh migration mới.
- Auth schema đã đồng bộ tới `20261118184004_role_author` (gồm `search_unicode`, `roles.status`, rename `created_by → author_id`); nếu DB cũ lệch (serial/thiếu `deleted`, thiếu `permissions String[]`) thì tạo lại DB hoặc chạy migrate deploy từ đầu.
- Migration `20261118184004_role_author` viết tay là `RENAME COLUMN`/`RENAME CONSTRAINT` (Prisma sinh drop/add → mất `created_by`)\). Nếu reset DB thì chạy SQL này trước, `psql` áp xong mới `migrate resolve --applied`.
- Lỗi `P2002` dù đã kiểm tra trùng tên → race giữa `existsByName` và insert; DB unique vẫn là chốt chặn, service map thành 400.
- Xoá role còn `user_roles` → repository đã xử lý transaction; nếu gọi Prisma trực tiếp phải tự `userRole.deleteMany` trước (FK RESTRICT).
- `email`/`username` không còn unique → dùng `findFirst`, không dùng `findUnique({ where: { email } })`.

## Keycloak

Keycloak chạy ở `http://localhost:8180` (admin `admin`/`admin`), realm `Ecosystem`, client `ecosystem_app`; cấu hình đọc từ `apps/auth/.env` (`KEYCLOAK_HOST`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`).

- **Lấy admin token + kiểm tra user theo email**:
  ```bash
  set -a && . apps/auth/.env && set +a
  AT=$(curl -s -X POST "$KEYCLOAK_HOST/realms/$KEYCLOAK_REALM/protocol/openid-connect/token" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -d "client_id=$KEYCLOAK_CLIENT_ID" -d "client_secret=$KEYCLOAK_CLIENT_SECRET" \
    -d 'grant_type=client_credentials' | jq -r .access_token)
  curl -s -H "Authorization: Bearer $AT" \
    "$KEYCLOAK_HOST/admin/realms/$KEYCLOAK_REALM/users?email=<email>"
  ```
- **Xoá user orphan** (Keycloak có, DB không có) rồi tạo lại:
  ```bash
  curl -i -X DELETE -H "Authorization: Bearer $AT" \
    "$KEYCLOAK_HOST/admin/realms/$KEYCLOAK_REALM/users/<keycloak-id>"
  ```
- **409 `User exists with same email/username`**: Keycloak chặn trùng; code hiện chưa map nên bff trả 500 chung. Đối chiếu user trong Keycloak và DB trước khi retry.
- **401/403 khi gọi Admin API**: 401 thường do `KEYCLOAK_CLIENT_SECRET` sai; 403 do service account của client thiếu role `realm-management` (`manage-users`, `view-users`).
- **Token verify fail dù token còn hạn**: kiểm tra `KEYCLOAK_HOST`/`KEYCLOAK_REALM` để auth lấy đúng JWKS; xem thêm mục GraphQL / auth.
- **Keycloak không có trong `docker-compose.apps.yaml`**: chỉ có ở `docker-compose.yaml` (infra); nếu chạy auth trong compose phải thêm service/`KEYCLOAK_HOST=http://keycloak:8080`.

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

- jobs GraphQL ở `http://localhost:3004/jobs`, không phải `/graphql`.
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

Kiểm tra cả port HTTP và gRPC; jobs 3004 không nằm trong `npm stop`.

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
