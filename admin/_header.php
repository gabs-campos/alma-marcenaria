<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/bootstrap.php';
admin_require_auth();
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - Alma Marcenaria</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/public/assets/styles.css">
</head>
<body class="admin">
  <?php
  $currentAdminPage = basename((string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH));
  $adminLinks = [
      ['href' => '/admin/dashboard.php', 'label' => 'Dashboard', 'slug' => 'dashboard.php'],
      ['href' => '/admin/home.php', 'label' => 'Página Inicial', 'slug' => 'home.php'],
      ['href' => '/admin/products.php', 'label' => 'Produtos', 'slug' => 'products.php'],
      ['href' => '/admin/categories.php', 'label' => 'Categorias', 'slug' => 'categories.php'],
      ['href' => '/admin/about.php', 'label' => 'Quem Somos', 'slug' => 'about.php'],
      ['href' => '/admin/orders.php', 'label' => 'Pedidos', 'slug' => 'orders.php'],
      ['href' => '/admin/users.php', 'label' => 'Admins', 'slug' => 'users.php'],
  ];
  ?>
  <div class="admin-shell">
    <aside class="admin-sidebar" id="admin-sidebar">
      <div class="admin-sidebar-top">
        <a class="admin-brand" href="/admin/dashboard.php">ALMA <span>ADMIN</span></a>
        <button
          class="admin-sidebar-toggle"
          type="button"
          data-admin-sidebar-toggle
          aria-expanded="true"
          aria-controls="admin-sidebar"
          aria-label="Colapsar menu">
          <span aria-hidden="true">|||</span>
        </button>
      </div>
      <nav class="admin-nav" aria-label="Admin">
        <?php foreach ($adminLinks as $item): ?>
          <a
            class="<?= $currentAdminPage === $item['slug'] ? 'is-active' : '' ?>"
            href="<?= e($item['href']) ?>">
            <?= e($item['label']) ?>
          </a>
        <?php endforeach; ?>
      </nav>
      <div class="admin-sidebar-footer">
        <a class="admin-logout" href="/admin/logout.php">Sair</a>
      </div>
    </aside>
    <div class="admin-content">
      <main class="container admin-main">
    <?php foreach (consume_flash() as $msg): ?>
      <div class="alert alert-<?= e($msg['type']) ?>"><?= e($msg['message']) ?></div>
    <?php endforeach; ?>
