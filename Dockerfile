# Development Dockerfile for Next.js project
#
# To run this project with Docker for development:
#
# 1. Build the image:
#    docker build -t dialectrees-dev .
#
# 2. Run with Docker (basic):
#    docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules --env-file .env dialectrees-dev
#
# 3. Run with Docker Compose (recommended):
#    Create docker-compose.yml and run: docker-compose up
#
# 4. Access the app at http://localhost:3000
#
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json pnpm-lock.yaml* yarn.lock* ./

# Install dependencies (supports npm, pnpm, or yarn)
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy source code
COPY . .

# Create .env file from example if it doesn't exist
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Expose port
EXPOSE 3000

# Set environment to development
ENV NODE_ENV=development

# Start development server with hot reload
CMD ["npm", "run", "dev"]