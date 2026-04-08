<?php
/**
 * setup_db.php — Run this ONCE to create the database.
 * Place this in your project root, run it via browser or CLI, then delete it.
 */

// Load environment manually
$envPath = __DIR__ . '/.env';
$env = [];
if (file_exists($envPath)) {
    foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            [$key, $val] = explode('=', $line, 2);
            $env[trim($key)] = trim($val, " \t\n\r\0\x0B\"'");
        }
    }
}

$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = $env['DB_PORT'] ?? '3306';
$dbName = $env['DB_DATABASE'] ?? 'ai_student_system';
$user = $env['DB_USERNAME'] ?? 'root';
$pass = $env['DB_PASSWORD'] ?? '';

echo "<pre style='font-family:monospace;background:#1e1e1e;color:#4ec9b0;padding:20px;border-radius:10px;'>";
echo "=== CNHS AI Student System — DB Setup ===\n\n";

try {
    // Connect without selecting a database first
    $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    echo "✅ Connected to MySQL server successfully!\n";

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Database '{$dbName}' created (or already exists)!\n";

    // Verify
    $stmt = $pdo->query("SHOW DATABASES LIKE '{$dbName}'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Verified: Database '{$dbName}' is ready.\n";
    }

    echo "\n🎉 SUCCESS! The database is ready.\n";
    echo "\nNext step: Run <strong>php artisan migrate</strong> in your project directory.\n";
    echo "Or from XAMPP: <strong>C:\\xampp\\php\\php.exe artisan migrate</strong>\n";

} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "\nPlease ensure MySQL is running in XAMPP Control Panel.\n";
}

echo "</pre>";

// Self-destruct warning
echo "<p style='color:red;font-weight:bold;'>⚠️ DELETE this file (setup_db.php) after use for security!</p>";
