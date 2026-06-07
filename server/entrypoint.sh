#!/bin/sh
set -e

if [ -n "$DB_HOST" ]; then
  echo "Waiting for PostgreSQL at $DB_HOST..."
  until pg_isready -h "$DB_HOST" -U "${POSTGRES_USER:-postgres}" > /dev/null 2>&1; do
    sleep 2
  done
  echo "PostgreSQL is ready."
fi

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed 2>/dev/null || echo "Seed skipped or already run"

echo "Starting server..."
exec node dist/index.js
