---
name: Cấu trúc Dự án
description: Bố cục thư mục và tổ chức của monorepo Ecosystem
applies_to:
  - Tổ chức file
  - Vị trí module
  - Đường dẫn import
---

# Cấu trúc Dự án

```
ecosystem/
├── apps/
│   ├── auth/              # Service xác thực
│   │   ├── src/
│   │   │   ├── app/       # Modules auth & user
│   │   │   └── main.ts    # Entry point (GraphQL + gRPC)
│   │   ├── prisma/        # Schema và migrations
│   │   └── project.json   # Cấu hình targets của Nx
│   ├── jobs/              # Service quản lý công việc
│   │   └── src/
│   │       ├── jobs/      # Jobs module
│   │       └── uploads/   # Xử lý file upload
│   ├── products/          # Service sản phẩm
│   └── executor/          # Service thực thi
├── libs/
│   ├── grpc/              # Định nghĩa gRPC & interceptors
│   ├── graphql/           # GraphQL plugins (logging)
│   ├── nestjs/            # NestJS utilities dùng chung
│   ├── prisma/            # Cấu hình ORM
│   └── pulsar/            # Cấu hình Pulsar client
├── docker-compose.yaml    # PostgreSQL + Pulsar
├── docker-compose.apps.yaml
├── nx.json                # Cấu hình workspace Nx
├── tsconfig.base.json     # TypeScript path aliases
└── jest.config.ts         # Cấu hình Jest
```
