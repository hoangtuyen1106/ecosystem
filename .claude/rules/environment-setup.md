---
name: Thiết lập Môi trường
description: Các yêu cầu tiên quyết và hướng dẫn setup phát triển cục bộ
applies_to:
  - Setup ban đầu
  - Phát triển cục bộ
  - Cấu hình môi trường
---

# Thiết lập Môi trường

## Yêu cầu Tiên quyết

- Node.js 22+
- npm 10+
- Protoc (được cài đặt bởi script CI setup)
- Docker & Docker Compose (cho PostgreSQL + Pulsar cục bộ)

## Setup Phát triển Cục bộ

1. Cài đặt dependencies:
   ```bash
   npm ci --legacy-peer-deps
   ```

2. Khởi động infrastructure:
   ```bash
   npm run docker:infra
   ```

3. Chạy migrations:
   ```bash
   npx nx run auth:migrate-prisma
   ```

4. Khởi động services:
   ```bash
   npm start
   ```

5. Truy cập services:
   - Auth GraphQL: http://localhost:3000/auth
   - Jobs GraphQL: http://localhost:3001/jobs
   - Products GraphQL: http://localhost:3002
   - Executor: http://localhost:3003

## Continuous Integration

CI chạy khi push đến `main` và tất cả pull requests (xem `.github/workflows/ci.yml`):
- Lint, test, và build chỉ các projects bị ảnh hưởng
- Node.js 22 với npm cache
- Protoc được cài đặt cho proto file compilation
- Sử dụng Nx's affected mode cho CI hiệu quả

Các bước CI tương lai (được comment) bao gồm Docker image building và pushing đến AWS ECR.
