---
paths:
  - 'apps/**'
  - 'libs/**'
  - 'docker-compose*.yaml'
  - 'docker/**'
  - 'scripts/**'
  - 'nx.json'
  - 'package.json'
  - 'tsconfig.base.json'
  - 'jest.config.ts'
  - 'webpack.*.config.js'
  - '.github/workflows/*.yml'
---

# Cấu trúc dự án

```text
ecosystem/
├── apps/
│   ├── auth/                  # Xác thực, users (Prisma + gRPC + JWT)
│   │   ├── src/app/
│   │   │   ├── auth/          # resolver, service, controller, guards, strategies
│   │   │   ├── users/         # service, repositories, dto
│   │   │   └── prisma/        # PrismaService (PrismaPg adapter)
│   │   ├── prisma/            # schema.prisma + migrations
│   │   ├── prisma.config.ts
│   │   └── src/generated/prisma/   # generated, không sửa tay
│   ├── bff/                   # REST gateway (Swagger, health, throttler)
│   │   └── src/app/health/
│   ├── executor/              # Pulsar consumers
│   │   └── src/app/jobs/{fibonacci,products}/
│   ├── jobs/                  # GraphQL + gRPC + upload + Pulsar producer
│   │   ├── src/app/
│   │   │   ├── jobs/          # abstract.job.ts, fibonacci/, products/
│   │   │   ├── decorators/    # @Job
│   │   │   ├── uploads/       # upload JSON
│   │   │   └── prisma/
│   │   └── prisma/
│   └── products/              # Drizzle + gRPC
│       ├── src/app/
│       │   ├── products/      # controller, service, schema.ts
│       │   ├── categories/    # service, schema.ts
│       │   └── database/      # DATABASE_CONNECTION
│       ├── drizzle/           # migration SQL + meta
│       └── drizzle.config.ts
├── libs/
│   ├── configuration/         # App/Base config, ThrottlerProvider
│   ├── graphql/               # guard, plugin, context, model
│   ├── grpc/                  # proto, generated types, interceptor
│   ├── nestjs/                # init(), LoggerModule, enum Jobs
│   ├── prisma/                # placeholder
│   ├── pulsar/                # client, consumer, messages
│   └── redis/                 # module + service
├── docker/init-db.sql         # tạo DB auth/jobs/products cho compose apps
├── scripts/                   # script thủ công (fibonacci.mjs)
├── charts/                    # Helm cũ, tên "jobber", chưa dùng trong CI
├── .github/workflows/ci.yml
├── docker-compose.yaml        # infra: postgres, pulsar, redis, keycloak
├── docker-compose.apps.yaml   # postgres + pulsar + redis + 4 app (không có bff)
├── nx.json
├── package.json               # workspaces + _moduleAliases
├── tsconfig.base.json         # path aliases @ecosystem/*
└── webpack.*.config.js
```

## Vị trí đặc thù

- Prisma: schema ở `apps/{auth,jobs}/prisma/schema.prisma`, config ở `apps/{auth,jobs}/prisma.config.ts`, client generated ở `apps/{service}/src/generated/prisma`.
- Drizzle: schema đặt cạnh feature (`apps/products/src/**/schema.ts`), migration trong `apps/products/drizzle`.
- gRPC: proto nguồn ở `libs/grpc/src/lib/proto`; types sinh ra ở `libs/grpc/src/lib/types/proto` (commit cùng repo).
- Upload runtime: `apps/jobs/uploads` (bị gitignore).
- `libs/grpc` build copy proto sang `dist/libs/grpc/proto`, nên `protoPath` trong code luôn trỏ tới đường dẫn `dist`.

## Quy ước đặt code

- Mỗi feature một module; resolver/controller/service/dto/model nằm cùng thư mục feature.
- GraphQL model/input chỉ ở jobs; model dùng chung đặt trong `libs/graphql` (`AbstractModel`).
- Repository pattern dùng ở auth (`apps/auth/src/app/users/repositories`).
- products inject `DATABASE_CONNECTION`; không tạo Prisma client cho products.
- Không sửa `src/generated/prisma`; sinh lại bằng target `generate-prisma`.
- Không import chéo giữa các app; giao tiếp qua gRPC hoặc Pulsar. Code dùng chung đặt trong `libs/`.
- `main.ts` phải có `require('module-alias/register')` ở dòng đầu.

## Thêm file mới ở đâu

| Cần thêm               | Vị trí                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Resolver/GraphQL model | `apps/jobs/src/app/` + module tương ứng                                                                               |
| Bảng Prisma            | `apps/{auth,jobs}/prisma/schema.prisma`                                                                               |
| Bảng Drizzle           | `apps/products/src/<feature>/schema.ts`                                                                               |
| gRPC method            | `libs/grpc/src/lib/proto/*.proto`, rồi regenerate types                                                               |
| Job mới                | enum `libs/nestjs/src/lib/jobs.ts`, message `libs/pulsar/src/lib/messages`, job `apps/jobs`, consumer `apps/executor` |
| Lib dùng chung         | `libs/<name>/src/index.ts` + alias `tsconfig.base.json` + `_moduleAliases`                                            |
| Biến môi trường        | `apps/*/.env` (local) + `docker-compose.apps.yaml` (container)                                                        |
