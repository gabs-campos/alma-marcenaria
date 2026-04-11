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
  <link rel="stylesheet" href="/public/assets/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="/admin/dashboard.php">ALMA <span>ADMIN</span></a>
      <nav class="main-nav">
        <a href="/admin/home.php">Página Inicial</a>
        <a href="/admin/products.php">Produtos</a>
        <a href="/admin/about.php">Quem Somos</a>
        <a href="/admin/orders.php">Pedidos</a>
        <a href="/admin/users.php">Admins</a>
      </nav>
      <a class="cart-link" href="/admin/logout.php">Sair</a>
    </div>
  </header>
  <main class="container">
    <?php foreach (consume_flash() as $msg): ?>
      <div class="alert alert-<?= e($msg['type']) ?>"><?= e($msg['message']) ?></div>
    <?php endforeach; ?>
