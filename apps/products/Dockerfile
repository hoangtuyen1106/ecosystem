# Builder Stage
FROM node:22-slim AS builder

WORKDIR /workspace

# Copy nescessary files for building the app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./
COPY webpack.*.config.js ./

COPY apps/products ./apps/products
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs

# Install dependencies
RUN npm install

RUN apt-get update && apt-get install -y protobuf-compiler

# Build the app
RUN npx nx build products

# Runner Stage
FROM node:22-slim AS runner

WORKDIR /app

# Copy nescessary files
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/apps/products/package.json ./apps/products/package.json
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json
COPY --from=builder /workspace/apps/products/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /workspace/apps/products/drizzle ./drizzle
COPY --from=builder /workspace/package-lock.json ./

# Set production environment
ENV NODE_ENV=production

# Install product dependencies
RUN npm ci

# Copy build output
COPY --from=builder /workspace/dist ./dist

#copy entrypoint script
COPY apps/products/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Run the application
ENTRYPOINT ["/app/docker-entrypoint.sh"]