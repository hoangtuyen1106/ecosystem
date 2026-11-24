# Builder Stage
FROM node:22-slim AS builder

WORKDIR /workspace

RUN apt-get update && apt-get install -y openssl

# Copy necessary files for building the app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./
COPY webpack.*.config.js ./

COPY apps/user-access ./apps/user-access
COPY libs ./libs

# Install dependencies
RUN npm install --legacy-peer-deps

RUN apt-get update && apt-get install -y protobuf-compiler

# Generate Prisma client
RUN cd apps/user-access && npx prisma generate

# Build the app
RUN npx nx build user-access

# Runner Stage
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy necessary files
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/apps/user-access/package.json ./apps/user-access/package.json
COPY --from=builder /workspace/libs/prisma/package.json ./libs/prisma/package.json
COPY --from=builder /workspace/apps/user-access/prisma ./prisma
COPY --from=builder /workspace/apps/user-access/prisma.config.ts ./prisma.config.ts
COPY --from=builder /workspace/package-lock.json ./

# Set production environment
ENV NODE_ENV=production

# Install product dependencies
RUN npm ci --legacy-peer-deps

# Copy build output
COPY --from=builder /workspace/dist ./dist

# Copy generated Prisma Client
COPY --from=builder /workspace/apps/user-access/src/generated ./apps/user-access/src/generated

# Copy entrypoint script
COPY apps/user-access/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Run the application
ENTRYPOINT ["/app/docker-entrypoint.sh"]
