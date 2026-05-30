#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until pg_isready -h postgres -U postgres -d task_tracker > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready."

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec node dist/server.js
