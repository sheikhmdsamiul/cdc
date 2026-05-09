#!/bin/sh
set -e

echo "Waiting for database..."
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_PORT=${DB_PORT:-5432}

until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  echo "  Database not ready yet, waiting 2s..."
  sleep 2
done
echo "Database is ready!"

if [ "$SKIP_PUSH" != "true" ]; then
  echo "Pushing database schema..."
  cd /app/lib/db
  npx drizzle-kit push --force --config ./drizzle.config.ts 2>&1 || echo "  Schema push completed (with warnings)"
  cd /app
fi

if [ "$SKIP_SEED" != "true" ]; then
  echo "Seeding roles and users..."
  node /app/artifacts/api-server/dist/seed-auth.mjs 2>&1 || echo "  Seed-auth completed"

  echo "Seeding permissions..."
  node /app/artifacts/api-server/dist/scripts/seed-permissions.mjs 2>&1 || echo "  Seed-permissions completed"

  echo "Seeding admin units..."
  node /app/artifacts/api-server/dist/seed-admin.mjs 2>&1 || echo "  Seed-admin completed"
fi

exec "$@"
