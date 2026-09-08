#!/bin/sh
set -e

if [ -n "$DB_HOST" ]; then
  echo "Waiting for PostgreSQL at $DB_HOST..."
  until pg_isready -h "$DB_HOST" -U "${POSTGRES_USER:-postgres}" > /dev/null 2>&1; do
    sleep 2
  done
  echo "PostgreSQL is ready."
fi

if [ -z "$DATABASE_URL" ] || [ -z "$DIRECT_URL" ]; then
  echo "ERROR: DATABASE_URL and DIRECT_URL must both be set."
  echo "On Supabase: DATABASE_URL = pooler ...:6543/postgres?pgbouncer=true"
  echo "             DIRECT_URL  = direct db.<ref>.supabase.co:5432/postgres (user 'postgres')"
  exit 1
fi

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$SKIP_SEED" = "true" ]; then
  echo "Skipping seed (SKIP_SEED=true)."
else
  echo "Seeding database..."
  npx prisma db seed 2>/dev/null || echo "Seed skipped or already run"
fi

echo "Starting server..."
exec node dist/index.js
