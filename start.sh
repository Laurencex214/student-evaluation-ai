#!/bin/bash
set -e

echo "=== Environment Setup ==="
if [ -n "$DATABASE_URL" ]; then
    # Laravel handles DATABASE_URL natively, we just ensure the connection type is mysql
    export DB_CONNECTION=${DB_CONNECTION:-mysql}
    echo "  Database URL detected, using $DB_CONNECTION connection."
fi

# Ensure basic directories exist
mkdir -p storage/framework/{sessions,views,cache}
chmod -R 775 storage bootstrap/cache

echo "=== Generating app key if missing ==="
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --no-interaction --force
fi

echo "=== Optimizing Application ==="
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "=== Running migrations ==="
php artisan migrate --force --no-interaction

echo "=== Creating storage link ==="
php artisan storage:link --force 2>/dev/null || true

echo "=== Starting PHP Server on port ${PORT:-8080} ==="
# Use the built-in server for simplicity in this environment
php -d upload_max_filesize=10M -d post_max_size=12M -S 0.0.0.0:${PORT:-8080} -t public
