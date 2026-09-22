# Builder Stage
FROM node:22-slim AS builder

WORKDIR /workspace

# Copy nescessary files for building the app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY eslint.config.mjs ./
COPY webpack.*.config.js ./

COPY apps/bff ./apps/bff
# COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs

# Install dependencies
RUN npm install

RUN apt-get update && apt-get install -y protobuf-compiler

# Build the app
RUN npx nx build bff

# Runner Stage
FROM node:22-slim AS runner

WORKDIR /app

# Copy nescessary files
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/apps/bff/package.json ./apps/bff/package.json
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json
COPY --from=builder /workspace/package-lock.json ./

# Set production environment
ENV NODE_ENV=production

# Install product dependencies
RUN npm ci

# Copy build output
COPY --from=builder /workspace/dist ./dist

#copy entrypoint script
COPY apps/bff/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Run the application
ENTRYPOINT ["/app/docker-entrypoint.sh"]