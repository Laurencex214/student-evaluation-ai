#!/bin/bash
set -e

echo "=== Parsing DATABASE_URL into Laravel DB vars ==="
if [ -n "$DATABASE_URL" ]; then
    # Parse mysql://user:password@host:port/database
    export DB_USERNAME=$(echo $DATABASE_URL | sed -e 's|.*://\([^:]*\):.*|\1|')
    export DB_PASSWORD=$(echo $DATABASE_URL | sed -e 's|.*://[^:]*:\([^@]*\)@.*|\1|')
    export DB_HOST=$(echo $DATABASE_URL | sed -e 's|.*@\([^:/]*\).*|\1|')
    export DB_PORT=$(echo $DATABASE_URL | sed -e 's|.*@[^:]*:\([0-9]*\)/.*|\1|')
    export DB_DATABASE=$(echo $DATABASE_URL | sed -e 's|.*/\([^?]*\).*|\1|')
    export DB_CONNECTION=mysql
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_DATABASE"
    echo "  User: $DB_USERNAME"
fi

echo "=== Generating app key if missing ==="
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --no-interaction --force
fi

echo "=== Clearing old caches ==="
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "=== Caching config/routes ==="
php artisan config:cache
php artisan route:cache

echo "=== Running migrations ==="
php artisan migrate --force --no-interaction

echo "=== Creating storage link ==="
php artisan storage:link --force 2>/dev/null || true

php -d upload_max_filesize=10M -d post_max_size=12M -S 0.0.0.0:${PORT:-8080} -t public
