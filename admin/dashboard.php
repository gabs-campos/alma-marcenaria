<?php
declare(strict_types=1);
require_once __DIR__ . '/_header.php';

$products = (int) db()->query('SELECT COUNT(*) FROM products')->fetchColumn();
$orders = (int) db()->query('SELECT COUNT(*) FROM orders')->fetchColumn();
?>
<h1 class="reveal">Dashboard</h1>
<section class="grid-3">
  <article class="card reveal"><h3>Produtos</h3><p><?= $products ?> cadastrados</p></article>
  <article class="card reveal"><h3>Pedidos</h3><p><?= $orders ?> recebidos</p></article>
  <article class="card reveal"><h3>Atalhos</h3><p>Gerencie Home, catálogo, conteúdo institucional e administradores.</p></article>
</section>
<?php require_once __DIR__ . '/_footer.php'; ?>
