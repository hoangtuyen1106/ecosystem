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

COPY apps/executor ./apps/executor
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs
COPY libs/pulsar ./libs/pulsar

# Install dependencies
RUN npm install

RUN apt-get update && apt-get install -y protobuf-compiler

# Build the app
RUN npx nx build executor

# Runner Stage
FROM node:22-slim AS runner

WORKDIR /app

# Copy nescessary files
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/apps/executor/package.json ./apps/executor/package.json
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json
COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/package.json
COPY --from=builder /workspace/package-lock.json ./

# Set production environment
ENV NODE_ENV=production

# Install product dependencies
RUN npm ci

# Copy build output
COPY --from=builder /workspace/dist ./dist

# Run the application
CMD ["node", "dist/apps/executor/main"]