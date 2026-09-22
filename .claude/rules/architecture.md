---
name: Tổng quan kiến trúc
description: Kiến trúc microservices Ecosystem sử dụng Nx, NestJS, GraphQL, và gRPC
applies_to:
  - Quyết định kiến trúc
  - Thiết kế service
  - Các mô hình giao tiếp
---

# Tổng quan kiến trúc

**Ecosystem** là một monorepo dựa trên Nx chứa hệ sinh thái microservices được xây dựng với NestJS, GraphQL, và gRPC.

## Stack công nghệ

- **Nx 23.0.1** — quản lý tác vụ và trực quan hóa đồ thị phụ thuộc
- **NestJS 11** — framework microservices
- **GraphQL (Apollo)** — API layer cho hầu hết các service
- **gRPC** — giao tiếp giữa các service
- **Prisma** — ORM cho PostgreSQL
- **Apache Pulsar** — event streaming/messaging

## Kiến trúc Service

### Apps (Microservices)

- `apps/auth` — Service xác thực với quản lý người dùng (GraphQL + gRPC)
- `apps/jobs` — Service quản lý công việc với hỗ trợ upload (GraphQL)
- `apps/products` — Service sản phẩm (GraphQL)
- `apps/executor` — Service thực thi tác vụ

### Thư viện dùng chung

- `libs/grpc` — Định nghĩa gRPC và proto packages
- `libs/graphql` — GraphQL utilities và plugins dùng chung
- `libs/nestjs` — NestJS utilities và khởi tạo chung
- `libs/prisma` — Cấu hình Prisma ORM
- `libs/pulsar` — Cấu hình Apache Pulsar client

## Các mô hình kiến trúc chính

### Path Aliases

Tất cả các thư viện có thể truy cập qua path aliases (được định nghĩa trong `tsconfig.base.json`):

```typescript
import { Packages } from '@ecosystem/grpc';
import { LoggerModule } from '@ecosystem/nestjs';
import { GqlLoggingPlugin } from '@ecosystem/graphql';
```

### Giao tiếp Service

- **GraphQL** — API layer chính cho từng service (HTTP)
- **gRPC** — Giao tiếp giữa các service với type safety
- **Pulsar** — Event streaming cho giao tiếp không đồng bộ

### Database riêng cho mỗi Service

Mỗi service (auth, jobs) có schema Prisma riêng và client được tạo:
- Prisma client được tạo đến `apps/{service}/src/generated/prisma`
- Tự động tạo trước các tác vụ build và serve
- Mỗi service chạy migrations độc lập

### Khởi tạo Module

Services sử dụng hàm `init` dùng chung từ `@ecosystem/nestjs`:

```typescript
const app = await NestFactory.create(AppModule, { bufferLogs: true });
await init(app, 'auth'); // Thiết lập logging, tracing, v.v.
```
