<?php
declare(strict_types=1);
require_once __DIR__ . '/_header.php';

$orders = db()->query('SELECT * FROM orders ORDER BY created_at DESC')->fetchAll();
?>
<h1>Pedidos</h1>
<?php if ($orders === []): ?>
  <p>Nenhum pedido registrado ainda.</p>
<?php else: ?>
  <?php foreach ($orders as $order): ?>
    <?php
    $stmt = db()->prepare(
        'SELECT oi.quantity, oi.price, p.name FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?'
    );
    $stmt->execute([(int) $order['id']]);
    $items = $stmt->fetchAll();
    ?>
    <article class="card" style="margin-bottom:12px;">
      <h3>Pedido #<?= (int) $order['id'] ?> - <?= e($order['customer_name']) ?></h3>
      <p><strong>Email:</strong> <?= e($order['customer_email']) ?> | <strong>Telefone:</strong> <?= e($order['customer_phone']) ?></p>
      <p><strong>Observações:</strong> <?= nl2br(e($order['notes'])) ?></p>
      <p><strong>Criado em:</strong> <?= e($order['created_at']) ?></p>
      <table class="table">
        <thead><tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th></tr></thead>
        <tbody>
          <?php foreach ($items as $item): ?>
            <tr>
              <td><?= e($item['name'] ?? 'Produto removido') ?></td>
              <td><?= (int) $item['quantity'] ?></td>
              <td><?= money_br((float) $item['price']) ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </article>
  <?php endforeach; ?>
<?php endif; ?>
<?php require_once __DIR__ . '/_footer.php'; ?>
