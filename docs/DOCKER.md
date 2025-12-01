# Docker Guide - Tennis Tournament App

This guide covers everything you need to know about using Docker with the Tennis Tournament application.

## Prerequisites

-   Docker installed ([Download Docker](https://www.docker.com/get-started))
-   Docker Compose installed (included with Docker Desktop)

## Quick Start

### Development with Docker Compose

The easiest way to run the app locally with Docker:

```bash
# Start the development environment
npm run docker:dev

# Or manually
docker-compose up --build
```

Access the app at http://localhost:3000

### Stop the containers

```bash
npm run docker:down

# Or manually
docker-compose down
```

---

## Docker Commands Reference

### Building Images

#### Production Build

```bash
# Build production image
npm run docker:build

# Or manually
docker build -t tennis-tournament:latest .
```

#### Development Build

```bash
# Build development image
docker build -t tennis-tournament:dev -f Dockerfile.dev .
```

### Running Containers

#### Run Production Container

```bash
docker run -p 3000:3000 \
  --env-file .env \
  tennis-tournament:latest
```

#### Run Development Container

```bash
docker run -p 3000:3000 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  --env-file .env.local \
  tennis-tournament:dev
```

### Docker Compose Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build

# Remove volumes (reset database)
docker-compose down -v
```

---

## Development Workflow

### 1. Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd tennis-tournament

# Copy environment file
cp .env.example .env.local

# Start development environment
npm run docker:dev
```

### 2. Making Changes

The development container uses volume mounts, so changes to your code are reflected immediately:

-   **Source code** (`src/`) - Hot reload enabled
-   **Public files** (`public/`) - Automatically updated
-   **Prisma schema** - Requires container restart

### 3. Database Changes

When you modify the Prisma schema:

```bash
# Stop containers
docker-compose down

# Create migration
npx prisma migrate dev --name your_migration_name

# Restart containers (migrations run automatically)
docker-compose up
```

### 4. Debugging

View container logs:

```bash
docker-compose logs -f web
```

Access container shell:

```bash
docker exec -it tennis-tournament-dev sh
```

---

## Production Deployment

### Building for Production

The production Dockerfile uses multi-stage builds for optimization:

1. **deps stage** - Installs production dependencies
2. **builder stage** - Builds the Next.js app
3. **runner stage** - Minimal runtime image

```bash
# Build production image
docker build -t tennis-tournament:prod .

# Tag for registry
docker tag tennis-tournament:prod ghcr.io/yourusername/tennis-tournament:latest

# Push to registry
docker push ghcr.io/yourusername/tennis-tournament:latest
```

### Environment Variables

Production containers require these environment variables:

```bash
DATABASE_URL=file:./dev.db  # Or PostgreSQL connection string
NEXTAUTH_SECRET=<your-secret-key>
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Running in Production

```bash
docker run -d \
  --name tennis-tournament \
  -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  -e NODE_ENV="production" \
  ghcr.io/yourusername/tennis-tournament:latest
```

---

## Database Management

### SQLite (Default)

SQLite database is stored in the container. For persistence:

```bash
# Create volume for database
docker volume create tennis-db

# Run with volume
docker run -d \
  -v tennis-db:/app/prisma \
  tennis-tournament:latest
```

### PostgreSQL (Recommended for Production)

Update `docker-compose.yml` to uncomment PostgreSQL service:

```yaml
services:
    db:
        image: postgres:16-alpine
        environment:
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: postgres
            POSTGRES_DB: tennis_tournament
        volumes:
            - postgres_data:/var/lib/postgresql/data
```

Update `DATABASE_URL`:

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/tennis_tournament
```

---

## Troubleshooting

### Container won't start

**Check logs:**

```bash
docker-compose logs web
```

**Common issues:**

-   Missing environment variables
-   Port 3000 already in use
-   Database migration errors

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in docker-compose.yml
```

### Database migration errors

```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

### Build failures

```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t tennis-tournament:latest .
```

### Volume permission issues

```bash
# Fix permissions (Linux)
sudo chown -R $USER:$USER .
```

---

## Performance Optimization

### Image Size

Current production image is optimized using:

-   Multi-stage builds
-   Alpine Linux base (smaller)
-   Only production dependencies
-   `.dockerignore` to exclude unnecessary files

### Build Cache

GitHub Actions uses cache for faster builds:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

Locally, Docker automatically caches layers.

### Resource Limits

Limit container resources:

```yaml
services:
    web:
        deploy:
            resources:
                limits:
                    cpus: "1"
                    memory: 1G
```

---

## Security Best Practices

✅ **Implemented:**

-   Non-root user in production container
-   Multi-stage builds (no dev dependencies in production)
-   `.dockerignore` excludes sensitive files
-   Environment variables for secrets

⚠️ **Recommendations:**

-   Use secrets management (Docker Secrets, Vault)
-   Scan images for vulnerabilities: `docker scan tennis-tournament:latest`
-   Keep base images updated
-   Use specific version tags, not `latest`

---

## CI/CD Integration

Docker images are automatically built and pushed via GitHub Actions:

1. **CI Workflow** - Runs on every push/PR
2. **Docker Build** - Builds and pushes to GitHub Container Registry
3. **Deploy** - Deploys to your platform

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full CI/CD documentation.

---

## Additional Resources

-   [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
-   [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
-   [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
