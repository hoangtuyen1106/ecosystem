---
name: Khắc phục Sự cố
description: Giải pháp cho các lỗi phát triển và build thường gặp
applies_to:
  - Build failures
  - gRPC errors
  - Test failures
  - Import errors
---

# Khắc phục Sự cố

## Build thất bại với lỗi Prisma

**Triệu chứng:** Lỗi liên quan Prisma, missing generated types

**Giải pháp:**
- Đảm bảo `prisma generate` đã chạy:
  ```bash
  npx nx run {service}:generate-prisma
  ```
- Kiểm tra PostgreSQL đang chạy:
  ```bash
  npm run docker:infra
  ```

## Lỗi gRPC compilation

**Triệu chứng:** Proto file compilation failures, lỗi type generation

**Giải pháp:**
- Xác minh protoc được cài đặt:
  ```bash
  protoc --version
  ```
- Xóa cache và rebuild:
  ```bash
  npx nx clean && npx nx build
  ```

## Tests thất bại sau khi thay đổi schema

**Triệu chứng:** Test failures sau khi sửa đổi Prisma schema

**Giải pháp:**
- Tái tạo Prisma client:
  ```bash
  npx nx run {service}:generate-prisma
  ```
- Chạy lại tests:
  ```bash
  npx nx test {service}
  ```

## Lỗi module alias

**Triệu chứng:** Lỗi import resolution với `@ecosystem/*` paths

**Giải pháp:**
- Đảm bảo `module-alias/register` được import trong entry points
- Xác minh `_moduleAliases` trong root `package.json` khớp với dist structure
