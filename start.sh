#!/bin/bash
set -e

# Diagnostic logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Error handler
error_handler() {
    log "ERROR: An error occurred on line $1. Check deploy logs for details."
    exit 1
}
trap 'error_handler $LINENO' ERR

log "=== Environment Setup ==="
if [ -n "$DATABASE_URL" ]; then
    export DB_CONNECTION=${DB_CONNECTION:-mysql}
    log "DATABASE_URL detected, using $DB_CONNECTION connection."
elif [ -n "$MYSQL_URL" ]; then
    export DB_CONNECTION=${DB_CONNECTION:-mysql}
    export DATABASE_URL="$MYSQL_URL"
    log "MYSQL_URL detected, standardizing to DATABASE_URL and using $DB_CONNECTION connection."
elif [ -n "$DB_URL" ]; then
    export DB_CONNECTION=${DB_CONNECTION:-mysql}
    export DATABASE_URL="$DB_URL"
    log "DB_URL detected, standardizing to DATABASE_URL and using $DB_CONNECTION connection."
else
    log "WARNING: No database URL (DATABASE_URL, MYSQL_URL, or DB_URL) detected. Defaulting to sqlite if not set elsewhere."
fi

# Ensure basic directories exist
log "Ensuring directory permissions..."
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache

log "=== Generating app key if missing ==="
# Create .env with placeholder if missing so key:generate doesn't complain
if [ ! -f .env ]; then
    log "Creating missing .env file with APP_KEY placeholder..."
    echo "APP_KEY=" > .env
fi

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:..." ]; then
    php artisan key:generate --no-interaction --force
    log "Generated new APP_KEY."
else
    log "APP_KEY is already set in environment."
fi

# Enable DEBUG mode for this troubleshooting phase
export APP_DEBUG=${APP_DEBUG:-true}
log "APP_DEBUG is set to $APP_DEBUG"

log "=== Optimizing Application ==="
# We use || true here so that even if caching fails, the server still attempts to start
php artisan config:cache || log "Warning: config:cache failed"
php artisan route:cache || log "Warning: route:cache failed"
php artisan view:cache || log "Warning: view:cache failed"

log "=== Running migrations ==="
# migrations are critical, so we don't use || true here
php artisan migrate --force --no-interaction
log "Migrations completed."

log "=== Creating storage link ==="
php artisan storage:link --force 2>/dev/null || log "Storage link already exists or failed (non-critical)"

log "=== Starting PHP Server on port ${PORT:-8080} ==="
# Start the server and capture output
php -d upload_max_filesize=10M -d post_max_size=12M -S 0.0.0.0:${PORT:-8080} -t public
