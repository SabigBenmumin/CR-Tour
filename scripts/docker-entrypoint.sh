#!/bin/sh
set -e

echo "🚀 Starting Tennis Tournament Application..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client (in case it's not already generated)
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ Setup complete! Starting Next.js server..."

# Start the Next.js application
exec node server.js
