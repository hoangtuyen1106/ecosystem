---
name: Các Tác vụ Phát triển Thường gặp
description: Các bước từng bước cho các tác vụ phát triển thường xuyên
applies_to:
  - Phát triển tính năng
  - Sửa đổi schema
  - Thay đổi contract
  - Tạo library
---

# Các Tác vụ Phát triển Thường gặp

## Thêm Tính năng Mới vào Service

1. Tạo resolver/controller trong module của service
2. Cập nhật Prisma schema nếu cần thay đổi database
3. Chạy Prisma migration:
   ```bash
   npx nx run {service}:migrate-prisma
   ```
4. Viết tests trong file `*.spec.ts`
5. Chạy affected tests:
   ```bash
   npx nx affected -t test
   ```

## Sửa đổi gRPC Contracts

1. Chỉnh sửa proto file trong `libs/grpc/proto/`
2. Proto types được tái tạo khi build
3. Cập nhật service implementations để phù hợp với contract mới
4. Rebuild affected services:
   ```bash
   npx nx affected -t build
   ```

## Thêm Thư viện Dùng chung Mới

```bash
npx nx g @nx/node:lib {libname}
```

Cập nhật `tsconfig.base.json` paths tự động, sau đó thêm vào imports.

## Kiểm thử Thay đổi Trên Nhiều Services

```bash
# Kiểm thử tất cả bị ảnh hưởng bởi thay đổi của bạn
npx nx affected -t lint test build

# Hoặc chạy tasks cụ thể:
npx nx run-many -t test -p auth jobs products
```
