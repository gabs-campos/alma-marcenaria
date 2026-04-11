<?php
declare(strict_types=1);

function e(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function redirect(string $path): void
{
    header('Location: ' . $path);
    exit;
}

function is_post(): bool
{
    return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
}

function old(string $key, string $default = ''): string
{
    return e($_POST[$key] ?? $default);
}

function money_br(float $amount): string
{
    return 'R$ ' . number_format($amount, 2, ',', '.');
}

function flash(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function consume_flash(): array
{
    $messages = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $messages;
}

function app_url(string $suffix = ''): string
{
    global $config;
    $base = $config['app']['base_url'];
    return $suffix === '' ? $base : $base . $suffix;
}

function fetch_about_content(): array
{
    $stmt = db()->query('SELECT * FROM about LIMIT 1');
    $about = $stmt->fetch();

    if ($about) {
        return $about;
    }

    return [
        'content' => 'A Alma Marcenaria transforma ideias em ambientes funcionais e atemporais.',
        'image' => null,
    ];
}

function fetch_home_content(): array
{
    $defaults = [
        'hero_eyebrow' => 'MARCENARIA AUTORAL EM SÃO PAULO',
        'hero_title' => 'Móveis sob medida com alma de madeira.',
        'hero_description' => 'Peças únicas com acabamento artesanal e desenho contemporâneo.',
        'hero_image' => null,
        'hero_image_caption' => 'Textura & proporção',
        'feature_1_title' => 'Sob medida',
        'feature_1_description' => 'Projetos pensados para o seu espaço.',
        'feature_2_title' => 'Marcenaria fina',
        'feature_2_description' => 'Encaixes, textura e proporção com atenção total.',
        'feature_3_title' => 'Peças prontas',
        'feature_3_description' => 'Linha com entrega mais rápida para seu ambiente.',
    ];

    ensure_home_content_table($defaults);

    try {
        $stmt = db()->query('SELECT * FROM home_content LIMIT 1');
        $home = $stmt->fetch();
    } catch (Throwable $e) {
        return $defaults;
    }

    if (!$home) {
        return $defaults;
    }

    return array_merge($defaults, $home);
}

function ensure_home_content_table(array $defaults): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    try {
        db()->exec(
            'CREATE TABLE IF NOT EXISTS home_content (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                hero_eyebrow VARCHAR(190) NOT NULL,
                hero_title VARCHAR(255) NOT NULL,
                hero_description TEXT NOT NULL,
                hero_image VARCHAR(255) NULL,
                hero_image_caption VARCHAR(255) NULL,
                feature_1_title VARCHAR(120) NOT NULL,
                feature_1_description TEXT NOT NULL,
                feature_2_title VARCHAR(120) NOT NULL,
                feature_2_description TEXT NOT NULL,
                feature_3_title VARCHAR(120) NOT NULL,
                feature_3_description TEXT NOT NULL,
                updated_at DATETIME NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
        );

        $stmt = db()->prepare(
            'INSERT INTO home_content (
                hero_eyebrow, hero_title, hero_description, hero_image, hero_image_caption,
                feature_1_title, feature_1_description, feature_2_title, feature_2_description, feature_3_title, feature_3_description, updated_at
            )
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
            WHERE NOT EXISTS (SELECT 1 FROM home_content)'
        );
        $stmt->execute([
            $defaults['hero_eyebrow'],
            $defaults['hero_title'],
            $defaults['hero_description'],
            $defaults['hero_image'],
            $defaults['hero_image_caption'],
            $defaults['feature_1_title'],
            $defaults['feature_1_description'],
            $defaults['feature_2_title'],
            $defaults['feature_2_description'],
            $defaults['feature_3_title'],
            $defaults['feature_3_description'],
        ]);
    } catch (Throwable $e) {
        // Mantém fallback de conteúdo e evita quebrar o frontend.
    }
}

function validate_image_upload(array $file): ?string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        return 'Falha no upload da imagem.';
    }

    if (($file['size'] ?? 0) > 4 * 1024 * 1024) {
        return 'Imagem muito grande. Limite de 4MB.';
    }

    $mime = mime_content_type($file['tmp_name']);
    $allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mime, $allowed, true)) {
        return 'Formato inválido. Use JPG, PNG ou WEBP.';
    }

    return null;
}

function store_uploaded_image(array $file): ?string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    $extension = pathinfo($file['name'] ?? 'img.jpg', PATHINFO_EXTENSION);
    $safeName = bin2hex(random_bytes(12)) . '.' . strtolower($extension ?: 'jpg');
    $subDir = 'images';
    $targetDir = __DIR__ . '/../uploads/' . $subDir;

    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0775, true);
    }

    $targetPath = $targetDir . '/' . $safeName;
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        return null;
    }

    return $subDir . '/' . $safeName;
}

function slugify(string $value): string
{
    $value = trim($value);
    if ($value === '') {
        return '';
    }

    $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
    if ($normalized === false) {
        $normalized = $value;
    }

    $slug = strtolower((string) preg_replace('/[^a-zA-Z0-9]+/', '-', $normalized));
    $slug = trim($slug, '-');
    return $slug;
}

function fetch_categories(): array
{
    return db()->query('SELECT id, name, slug FROM categories ORDER BY name ASC')->fetchAll();
}

function fetch_product_images(int $productId): array
{
    $stmt = db()->prepare('SELECT id, image_path, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC');
    $stmt->execute([$productId]);
    return $stmt->fetchAll();
}

function fetch_product_images_map(array $productIds): array
{
    if ($productIds === []) {
        return [];
    }

    $productIds = array_values(array_unique(array_map(static fn ($id): int => (int) $id, $productIds)));
    $placeholders = implode(',', array_fill(0, count($productIds), '?'));
    $stmt = db()->prepare(
        "SELECT id, product_id, image_path, sort_order FROM product_images WHERE product_id IN ($placeholders) ORDER BY product_id ASC, sort_order ASC, id ASC"
    );
    $stmt->execute($productIds);

    $byProduct = [];
    foreach ($stmt->fetchAll() as $row) {
        $productId = (int) $row['product_id'];
        if (!isset($byProduct[$productId])) {
            $byProduct[$productId] = [];
        }
        $byProduct[$productId][] = $row;
    }

    return $byProduct;
}
