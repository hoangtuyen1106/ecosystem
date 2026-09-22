---
name: Lệnh Phát triển
description: Các lệnh CLI thông dụng cho phát triển, build, test, và code quality
applies_to:
  - Quy trình phát triển
  - Build và serve
  - Kiểm thử
  - Chất lượng code
---

# Lệnh Phát triển

## Khởi động Môi trường Phát triển

```bash
# Khởi động tất cả services song song (auth, jobs, executor, products trên ports 3000-3003)
npm start

# Dừng tất cả services đang chạy
npm stop

# Khởi động infrastructure (PostgreSQL, Pulsar)
npm run docker:infra

# Khởi động tất cả services trong Docker containers
npm run docker:apps

# Dừng Docker containers
npm run docker:apps:down
```

## Build và Serve Các Service Riêng lẻ

```bash
# Serve một app cụ thể
npx nx serve auth
npx nx serve jobs
npx nx serve products
npx nx serve executor

# Xem tất cả available targets cho một service
npx nx show project auth

# Build cho production
npx nx build auth

# Build tất cả apps
npx nx build
```

## Kiểm thử

```bash
# Chạy tất cả tests
npx nx test

# Chạy tests cho một app cụ thể
npx nx test auth
npx nx test jobs

# Chạy tests cho code thay đổi trong branch hiện tại
npx nx affected -t test

# Watch mode cho một app cụ thể
npx nx test auth --watch
```

## Chất lượng Code

```bash
# Lint tất cả projects
npx nx lint

# Lint một app cụ thể
npx nx lint auth

# Lint files bị ảnh hưởng
npx nx affected -t lint

# Format code
npx prettier --write .
```

## Database và Code Generation

```bash
# Tạo Prisma client (tự động chạy trước build/serve)
npx nx run auth:generate-prisma
npx nx run jobs:generate-prisma

# Chạy Prisma migrations
npx nx run auth:migrate-prisma
npx nx run jobs:migrate-prisma

# Tái tạo gRPC types từ proto files
# Điều này xảy ra khi build qua protoc setup trong CI
```

## Nx Utilities

```bash
# Trực quan hóa đồ thị phụ thuộc của tất cả projects
npx nx graph

# Hiển thị affected projects dựa trên thay đổi hiện tại
npx nx affected:graph

# Chạy nhiều tasks trên các projects
npx nx run-many -t build -p auth jobs products executor
```
