# Deployment Guide - Tennis Tournament App

Complete guide for deploying the Tennis Tournament application to production.

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Environment Setup](#environment-setup)
-   [CI/CD Pipeline](#cicd-pipeline)
-   [Deployment Platforms](#deployment-platforms)
-   [Post-Deployment](#post-deployment)
-   [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

-   Git repository hosted on GitHub
-   Docker installed locally (for testing)
-   Production domain (optional but recommended)

### Recommended

-   SSL certificate (most platforms provide free SSL)
-   Database backup strategy
-   Monitoring/logging solution

---

## Environment Setup

### 1. Environment Variables

Create production environment variables. **Never commit these to Git!**

Required variables:

```bash
# Database
DATABASE_URL=file:./prod.db  # Or PostgreSQL connection string

# Authentication
NEXTAUTH_SECRET=<generate-secure-secret>
NEXTAUTH_URL=https://your-production-domain.com

# Node Environment
NODE_ENV=production
```

#### Generate Secure Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Database Configuration

#### Option A: SQLite (Simple, Single Server)

```bash
DATABASE_URL=file:./prod.db
```

**Pros:** Simple, no external dependencies  
**Cons:** Not suitable for multi-instance deployments

#### Option B: PostgreSQL (Recommended for Production)

```bash
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

**Pros:** Scalable, robust, supports multiple instances  
**Cons:** Requires external database service

**PostgreSQL Providers:**

-   [Supabase](https://supabase.com) - Free tier available
-   [Neon](https://neon.tech) - Serverless PostgreSQL
-   [Railway](https://railway.app) - Includes database
-   [AWS RDS](https://aws.amazon.com/rds/)

---

## CI/CD Pipeline

The project includes three GitHub Actions workflows:

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Push to `main`/`develop`, Pull Requests

**Steps:**

1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies
4. ✅ Generate Prisma client
5. ✅ Run ESLint
6. ✅ TypeScript type check
7. ✅ Build Next.js app

### 2. Docker Build Workflow (`.github/workflows/docker-build.yml`)

**Triggers:** Push to `main`, Manual dispatch

**Steps:**

1. ✅ Build Docker image
2. ✅ Push to GitHub Container Registry
3. ✅ Tag with `latest` and commit SHA

**Registry:** `ghcr.io/<username>/<repo>:latest`

### 3. Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:** After successful Docker build, Manual dispatch

**Steps:** Template - customize for your platform

### Setting Up GitHub Secrets

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add these secrets:

| Secret Name       | Description             | Example              |
| ----------------- | ----------------------- | -------------------- |
| `NEXTAUTH_SECRET` | Authentication secret   | `<generated-secret>` |
| `DATABASE_URL`    | Production database URL | `postgresql://...`   |

**Platform-specific secrets** (add as needed):

-   `RENDER_DEPLOY_HOOK_URL` - For Render.com
-   `RAILWAY_WEBHOOK_URL` - For Railway
-   `DIGITALOCEAN_ACCESS_TOKEN` - For DigitalOcean
-   `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` - For SSH deployment

---

## Deployment Platforms

### Option 1: Render.com (Recommended for Beginners)

**Pros:** Easy setup, free tier, automatic SSL  
**Cons:** Cold starts on free tier

#### Steps:

1. **Create Account:** [render.com](https://render.com)

2. **New Web Service:**

    - Connect GitHub repository
    - Select "Docker" as environment
    - Configure:
        ```
        Name: tennis-tournament
        Region: Choose closest to users
        Branch: main
        Dockerfile Path: ./Dockerfile
        ```

3. **Environment Variables:**
   Add in Render dashboard:

    ```
    DATABASE_URL=<your-db-url>
    NEXTAUTH_SECRET=<your-secret>
    NEXTAUTH_URL=https://your-app.onrender.com
    NODE_ENV=production
    ```

4. **Deploy:**

    - Click "Create Web Service"
    - Render automatically builds and deploys

5. **Custom Domain (Optional):**
    - Settings → Custom Domain
    - Add your domain and configure DNS

#### Deploy Hook (for CI/CD):

1. Settings → Deploy Hook → Create
2. Copy webhook URL
3. Add to GitHub Secrets as `RENDER_DEPLOY_HOOK_URL`
4. Uncomment Render deployment in `.github/workflows/deploy.yml`

---

### Option 2: Railway.app

**Pros:** Simple, includes database, generous free tier  
**Cons:** Pricing can scale quickly

#### Steps:

1. **Create Account:** [railway.app](https://railway.app)

2. **New Project:**

    - "Deploy from GitHub repo"
    - Select your repository

3. **Add PostgreSQL:**

    - New → Database → PostgreSQL
    - Copy `DATABASE_URL` from variables

4. **Configure Web Service:**

    - Settings → Environment Variables:
        ```
        DATABASE_URL=${{Postgres.DATABASE_URL}}
        NEXTAUTH_SECRET=<your-secret>
        NEXTAUTH_URL=https://<your-app>.up.railway.app
        NODE_ENV=production
        ```

5. **Deploy:**
    - Railway auto-deploys on push to main

---

### Option 3: DigitalOcean App Platform

**Pros:** Reliable, scalable, good documentation  
**Cons:** No free tier

#### Steps:

1. **Create Account:** [digitalocean.com](https://www.digitalocean.com)

2. **Create App:**

    - Apps → Create App
    - Connect GitHub repository
    - Choose "Dockerfile" as source

3. **Configure:**

    ```
    Name: tennis-tournament
    Region: Choose closest
    Plan: Basic ($5/month)
    ```

4. **Environment Variables:**

    ```
    DATABASE_URL=<your-db-url>
    NEXTAUTH_SECRET=<your-secret>
    NEXTAUTH_URL=https://your-app.ondigitalocean.app
    ```

5. **Database (Optional):**
    - Add PostgreSQL database component
    - Use `${db.DATABASE_URL}` in app config

---

### Option 4: Self-Hosted (VPS/Cloud)

**Pros:** Full control, cost-effective at scale  
**Cons:** Requires server management

#### Requirements:

-   VPS with Docker installed (DigitalOcean Droplet, AWS EC2, etc.)
-   Domain with DNS configured
-   SSL certificate (use Let's Encrypt)

#### Steps:

1. **Setup Server:**

    ```bash
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh

    # Install Docker Compose
    sudo apt install docker-compose
    ```

2. **Pull Image:**

    ```bash
    docker pull ghcr.io/<username>/tennis-tournament:latest
    ```

3. **Create Environment File:**

    ```bash
    nano /opt/tennis-tournament/.env
    ```

    Add your environment variables.

4. **Run Container:**

    ```bash
    docker run -d \
      --name tennis-tournament \
      --restart unless-stopped \
      -p 3000:3000 \
      --env-file /opt/tennis-tournament/.env \
      ghcr.io/<username>/tennis-tournament:latest
    ```

5. **Setup Nginx Reverse Proxy:**

    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

6. **SSL with Certbot:**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## Post-Deployment

### 1. Verify Deployment

-   ✅ Application loads correctly
-   ✅ Authentication works
-   ✅ Database connections successful
-   ✅ SSL certificate valid
-   ✅ Environment variables applied

### 2. Database Migrations

Migrations run automatically via `docker-entrypoint.sh`.

Manual migration (if needed):

```bash
docker exec -it <container-name> npx prisma migrate deploy
```

### 3. Create Admin User

Access your production app and register the first user, then manually update the database:

```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
```

### 4. Monitoring

**Application Logs:**

```bash
# Render/Railway: View in dashboard
# Self-hosted:
docker logs -f tennis-tournament
```

**Recommended Tools:**

-   [Sentry](https://sentry.io) - Error tracking
-   [LogRocket](https://logrocket.com) - Session replay
-   [UptimeRobot](https://uptimerobot.com) - Uptime monitoring

### 5. Backups

**SQLite:**

```bash
# Backup database file
docker cp tennis-tournament:/app/prisma/prod.db ./backup-$(date +%Y%m%d).db
```

**PostgreSQL:**

```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**Automated Backups:**

-   Most managed databases include automatic backups
-   Setup cron job for self-hosted solutions

---

## Troubleshooting

### Application won't start

**Check logs:**

```bash
# Platform dashboard or
docker logs tennis-tournament
```

**Common issues:**

-   Missing environment variables
-   Database connection failed
-   Port conflicts

### Database migration errors

```bash
# Reset migrations (⚠️ destroys data)
docker exec -it tennis-tournament npx prisma migrate reset

# Or manually run migrations
docker exec -it tennis-tournament npx prisma migrate deploy
```

### Authentication not working

-   Verify `NEXTAUTH_URL` matches your domain
-   Check `NEXTAUTH_SECRET` is set
-   Ensure cookies are allowed (HTTPS required in production)

### Build failures in CI/CD

-   Check GitHub Actions logs
-   Verify all dependencies in `package.json`
-   Ensure Prisma schema is valid

### Performance issues

-   Enable Next.js caching
-   Use CDN for static assets
-   Upgrade server resources
-   Consider database indexing

---

## Scaling Considerations

### Horizontal Scaling

To run multiple instances:

1. **Use PostgreSQL** (not SQLite)
2. **Shared session storage** (Redis for NextAuth)
3. **Load balancer** (most platforms provide this)

### Database Optimization

-   Add indexes to frequently queried fields
-   Use connection pooling (PgBouncer)
-   Regular VACUUM (PostgreSQL)

### Caching

-   Enable Next.js ISR (Incremental Static Regeneration)
-   Use Redis for session/data caching
-   CDN for static assets

---

## Security Checklist

-   ✅ HTTPS enabled (SSL certificate)
-   ✅ Environment variables secured (not in code)
-   ✅ Database credentials rotated regularly
-   ✅ CORS configured properly
-   ✅ Rate limiting implemented (consider adding)
-   ✅ Regular dependency updates
-   ✅ Security headers configured

---

## Additional Resources

-   [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
-   [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
-   [Docker Security](https://docs.docker.com/engine/security/)
-   [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Support

For issues or questions:

1. Check application logs
2. Review this documentation
3. Check GitHub Issues
4. Contact platform support (Render, Railway, etc.)
