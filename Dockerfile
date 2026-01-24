# Multi-stage build for Azurinsight Server + UI
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for server
COPY packages/server/package.json packages/server/package-lock.json ./packages/server/

# Install server dependencies (including devDependencies for TypeScript compilation)
RUN cd packages/server && npm install

# Copy package files for UI
COPY packages/ui/package.json packages/ui/package-lock.json ./packages/ui/

# Install UI dependencies
RUN cd packages/ui && npm install

# Copy source code
COPY packages/server ./packages/server
COPY packages/ui ./packages/ui

# Build the server and UI
RUN cd packages/server && npm run build && \
    cd ../ui && npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY packages/server/package.json packages/server/package-lock.json ./packages/server/

RUN cd packages/server && npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/ui/dist ./packages/ui/dist

# Create directory for SQLite database
RUN mkdir -p /data

# Set environment variables
ENV PORT=5000
ENV DB_PATH=/data/telemetry.sqlite
ENV NODE_ENV=production

# Expose the server port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "packages/server/dist/index.js"]
