<?php
declare(strict_types=1);

/**
 * Simple migration runner for SQL files in /migrations.
 *
 * Usage:
 *   php scripts/migrate.php [path/to/deploy.env]
 */

function fail(string $message, int $code = 1): never
{
    fwrite(STDERR, "[ERROR] {$message}\n");
    exit($code);
}

function info(string $message): void
{
    fwrite(STDOUT, "[INFO] {$message}\n");
}

function loadEnvFile(string $path): array
{
    if (!is_file($path)) {
        fail("Env file not found: {$path}");
    }

    $vars = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        fail("Unable to read env file: {$path}");
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }
        $vars[trim($parts[0])] = trim($parts[1]);
    }

    return $vars;
}

$rootDir = realpath(__DIR__ . '/..');
if ($rootDir === false) {
    fail('Could not resolve project root.');
}

$envPath = $argv[1] ?? $rootDir . '/config/deploy.env';
$env = loadEnvFile($envPath);

$required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS', 'DB_CHARSET'];
foreach ($required as $key) {
    if (!isset($env[$key]) || $env[$key] === '') {
        fail("Missing env key: {$key}");
    }
}

$dsn = sprintf(
    'mysql:host=%s;port=%d;dbname=%s;charset=%s',
    $env['DB_HOST'],
    (int) $env['DB_PORT'],
    $env['DB_NAME'],
    $env['DB_CHARSET']
);

try {
    $pdo = new PDO(
        $dsn,
        $env['DB_USER'],
        $env['DB_PASS'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (Throwable $e) {
    fail('Database connection failed: ' . $e->getMessage());
}

$pdo->exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        checksum CHAR(64) NOT NULL,
        applied_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
);

$migrationsDir = $rootDir . '/migrations';
if (!is_dir($migrationsDir)) {
    fail("Migrations directory not found: {$migrationsDir}");
}

$files = glob($migrationsDir . '/*.sql');
if ($files === false) {
    fail('Failed to list migrations.');
}

sort($files, SORT_STRING);

if ($files === []) {
    info('No migration files found.');
    exit(0);
}

$appliedStmt = $pdo->query('SELECT filename, checksum FROM schema_migrations');
$applied = [];
foreach ($appliedStmt->fetchAll() as $row) {
    $applied[$row['filename']] = $row['checksum'];
}

$insertStmt = $pdo->prepare(
    'INSERT INTO schema_migrations (filename, checksum, applied_at) VALUES (?, ?, NOW())'
);

$executed = 0;
foreach ($files as $filePath) {
    $filename = basename($filePath);
    $sql = file_get_contents($filePath);
    if ($sql === false) {
        fail("Cannot read migration file: {$filename}");
    }

    $checksum = hash('sha256', $sql);
    if (isset($applied[$filename])) {
        if ($applied[$filename] !== $checksum) {
            fail("Checksum mismatch for already applied migration: {$filename}");
        }
        info("Skipping already applied: {$filename}");
        continue;
    }

    info("Applying migration: {$filename}");
    try {
        // DDL statements (CREATE/ALTER) may trigger implicit commits in MySQL.
        // To keep migrations robust, run each file without wrapping in a transaction.
        $pdo->exec($sql);
        $insertStmt->execute([$filename, $checksum]);
        $executed++;
    } catch (Throwable $e) {
        fail("Migration failed ({$filename}): " . $e->getMessage());
    }
}

info("Migration complete. Applied {$executed} new file(s).");
