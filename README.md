## Getting Started

### Local Development

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Docker Development

To run this project using the Dockerfile at the root of the project:

1. **Build the Docker image:**
   ```bash
   docker build -t dialectrees-dev .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules --env-file .env dialectrees-dev
   ```

3. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser

**Prerequisites:**
- Make sure you have Docker installed
- Copy `.env.example` to `.env` and configure your environment variables
- The Dockerfile is located at the root of the project

**What this does:**
- Builds a development container with Node.js and all dependencies
- Mounts your local code for hot reloading
- Exposes port 3000 for the Next.js development server
- Uses your local `.env` file for configuration

### Docker Compose (Recommended)

For a complete development environment with database, use Docker Compose:

1. **Start all services:**
   ```bash
   docker-compose up
   ```

2. **Run in background (detached mode):**
   ```bash
   docker-compose up -d
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Rebuild and start (after code changes):**
   ```bash
   docker-compose up --build
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f
   ```

**What Docker Compose includes:**
- **Next.js App**: Your application running on port 3000
- **PostgreSQL Database**: Running on port 5432 with persistent data
- **Hot Reloading**: Code changes are reflected immediately
- **Health Checks**: Ensures database is ready before starting the app
- **Persistent Storage**: Database data survives container restarts

**Database Connection:**
The compose file automatically configures the database connection. Your app will connect to:
- Host: `postgres` (internal Docker network)
- Database: `DialectreesDB`
- User: `postgres`
- Password: `password`
- Port: `5432`
