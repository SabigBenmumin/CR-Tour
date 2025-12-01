#!/bin/sh
set -e

echo "🚀 Starting Tennis Tournament Application..."

# Run database migrations using local Prisma installation
echo "📦 Running database migrations..."
node_modules/.bin/prisma migrate deploy

# Generate Prisma Client (in case it's not already generated)
echo "🔧 Generating Prisma Client..."
node_modules/.bin/prisma generate

echo "✅ Setup complete! Starting Next.js server..."

# Start the Next.js application
exec node server.js
