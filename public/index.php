<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

$page = $_GET['page'] ?? 'home';
$allowedPages = ['home', 'shop', 'product', 'cart', 'about', 'contact'];
if (!in_array($page, $allowedPages, true)) {
    $page = 'home';
}

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

if (is_post() && isset($_POST['action']) && $_POST['action'] === 'add_to_cart') {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect(app_url('?page=shop'));
    }

    $productId = (int) ($_POST['product_id'] ?? 0);
    $qty = max(1, (int) ($_POST['quantity'] ?? 1));
    $_SESSION['cart'][$productId] = ($_SESSION['cart'][$productId] ?? 0) + $qty;
    flash('success', 'Produto adicionado ao carrinho.');
    redirect(app_url('?page=cart'));
}

if (is_post() && isset($_POST['action']) && $_POST['action'] === 'update_cart') {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect(app_url('?page=cart'));
    }

    foreach (($_POST['qty'] ?? []) as $productId => $qty) {
        $productId = (int) $productId;
        $qty = (int) $qty;
        if ($qty <= 0) {
            unset($_SESSION['cart'][$productId]);
        } else {
            $_SESSION['cart'][$productId] = $qty;
        }
    }
    flash('success', 'Carrinho atualizado.');
    redirect(app_url('?page=cart'));
}

if (is_post() && isset($_POST['action']) && $_POST['action'] === 'checkout') {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect(app_url('?page=cart'));
    }

    $name = trim((string) ($_POST['customer_name'] ?? ''));
    $email = trim((string) ($_POST['customer_email'] ?? ''));
    $phone = trim((string) ($_POST['customer_phone'] ?? ''));
    $notes = trim((string) ($_POST['notes'] ?? ''));

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $phone === '') {
        flash('error', 'Preencha nome, email válido e telefone.');
        redirect(app_url('?page=cart'));
    }

    $cart = $_SESSION['cart'] ?? [];
    if ($cart === []) {
        flash('error', 'Seu carrinho está vazio.');
        redirect(app_url('?page=shop'));
    }

    $ids = array_keys($cart);
    $placeholder = implode(',', array_fill(0, count($ids), '?'));
    $stmt = db()->prepare("SELECT id, name, price FROM products WHERE id IN ($placeholder)");
    $stmt->execute($ids);
    $products = $stmt->fetchAll();

    $byId = [];
    foreach ($products as $product) {
        $byId[(int) $product['id']] = $product;
    }

    $pdo = db();
    $pdo->beginTransaction();
    try {
        $insertOrder = $pdo->prepare(
            'INSERT INTO orders (customer_name, customer_email, customer_phone, notes, created_at) VALUES (?, ?, ?, ?, NOW())'
        );
        $insertOrder->execute([$name, $email, $phone, $notes]);
        $orderId = (int) $pdo->lastInsertId();

        $insertItem = $pdo->prepare(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
        );

        $total = 0.0;
        $rows = '';
        foreach ($cart as $productId => $quantity) {
            if (!isset($byId[(int) $productId])) {
                continue;
            }
            $product = $byId[(int) $productId];
            $price = (float) $product['price'];
            $quantity = (int) $quantity;
            $subtotal = $price * $quantity;
            $total += $subtotal;
            $insertItem->execute([$orderId, (int) $productId, $quantity, $price]);
            $rows .= '<tr><td>' . e($product['name']) . '</td><td>' . $quantity . '</td><td>' . money_br($subtotal) . '</td></tr>';
        }

        $pdo->commit();

        $body = '
            <h2>Novo pedido - Alma Marcenaria</h2>
            <p><strong>Cliente:</strong> ' . e($name) . '</p>
            <p><strong>Email:</strong> ' . e($email) . '</p>
            <p><strong>Telefone:</strong> ' . e($phone) . '</p>
            <p><strong>Observações:</strong> ' . nl2br(e($notes)) . '</p>
            <table border="1" cellpadding="8" cellspacing="0">
              <thead><tr><th>Produto</th><th>Qtd</th><th>Subtotal</th></tr></thead>
              <tbody>' . $rows . '</tbody>
            </table>
            <p><strong>Total:</strong> ' . money_br($total) . '</p>
        ';
        send_html_email('Novo pedido #' . $orderId, $body);

        $_SESSION['cart'] = [];
        flash('success', 'Pedido enviado com sucesso. Entraremos em contato.');
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        flash('error', 'Não foi possível concluir o pedido.');
    }
    redirect(app_url('?page=cart'));
}

if (is_post() && isset($_POST['action']) && $_POST['action'] === 'contact_form') {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect(app_url('?page=contact'));
    }

    $name = trim((string) ($_POST['name'] ?? ''));
    $email = trim((string) ($_POST['email'] ?? ''));
    $message = trim((string) ($_POST['message'] ?? ''));

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
        flash('error', 'Preencha todos os campos do contato.');
        redirect(app_url('?page=contact'));
    }

    $body = '
        <h2>Contato via site</h2>
        <p><strong>Nome:</strong> ' . e($name) . '</p>
        <p><strong>Email:</strong> ' . e($email) . '</p>
        <p><strong>Mensagem:</strong><br>' . nl2br(e($message)) . '</p>
    ';

    send_html_email('Novo contato do site', $body);
    flash('success', 'Mensagem enviada com sucesso.');
    redirect(app_url('?page=contact'));
}

$flashMessages = consume_flash();
$cartCount = array_sum($_SESSION['cart']);
$home = fetch_home_content();
$whatsappMessage = 'Olá! Gostaria de solicitar um orçamento para a Alma Marcenaria.';
$whatsappUrl = 'https://wa.me/5511948121301?text=' . rawurlencode($whatsappMessage);
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alma Marcenaria</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/public/assets/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="<?= e(app_url()) ?>">
        <span class="brand-mark" aria-hidden="true">AM</span>
        <span class="brand-text">ALMA<span>MARCENARIA</span></span>
      </a>
      <nav class="main-nav" aria-label="Principal">
        <a href="<?= e(app_url()) ?>">Início</a>
        <a href="<?= e(app_url('?page=shop')) ?>">Loja</a>
        <a href="<?= e(app_url('?page=about')) ?>">Quem Somos</a>
        <a href="<?= e($whatsappUrl) ?>" target="_blank" rel="noopener noreferrer">Contato</a>
      </nav>
      <div class="header-actions">
        <a class="cart-pill" href="<?= e(app_url('?page=cart')) ?>">Carrinho <?= (int) $cartCount ?></a>
      </div>
    </div>
  </header>

  <main class="container">
    <?php foreach ($flashMessages as $msg): ?>
      <div class="alert alert-<?= e($msg['type']) ?>"><?= e($msg['message']) ?></div>
    <?php endforeach; ?>

    <?php if ($page === 'home'): ?>
      <section class="hero reveal">
        <div>
          <p class="eyebrow"><?= e($home['hero_eyebrow']) ?></p>
          <h1><?= e($home['hero_title']) ?></h1>
          <p><?= e($home['hero_description']) ?></p>
          <div class="btn-row">
            <a class="btn btn-light" href="<?= e(app_url('?page=shop')) ?>">Ver peças disponíveis</a>
            <a class="btn" href="<?= e($whatsappUrl) ?>" target="_blank" rel="noopener noreferrer">Solicitar orçamento</a>
          </div>
        </div>
        <div class="hero-card">
          <?php if (!empty($home['hero_image'])): ?>
            <img src="/uploads/<?= e($home['hero_image']) ?>" alt="<?= e($home['hero_title']) ?>" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">
          <?php else: ?>
            <p><strong><?= e($home['hero_image_caption']) ?></strong><br>Imagem do portfólio entra aqui (otimizada).</p>
          <?php endif; ?>
        </div>
      </section>
      <section class="grid-3">
        <article class="card reveal"><h3><?= e($home['feature_1_title']) ?></h3><p><?= e($home['feature_1_description']) ?></p></article>
        <article class="card reveal"><h3><?= e($home['feature_2_title']) ?></h3><p><?= e($home['feature_2_description']) ?></p></article>
        <article class="card reveal"><h3><?= e($home['feature_3_title']) ?></h3><p><?= e($home['feature_3_description']) ?></p></article>
      </section>
    <?php endif; ?>

    <?php if ($page === 'shop'): ?>
      <?php
      $category = trim((string) ($_GET['category'] ?? ''));
      $categories = fetch_categories();

      if ($category !== '') {
          $stmt = db()->prepare(
              'SELECT p.*, c.name AS category_name, c.slug AS category_slug, pi.image_path AS cover_image
               FROM products p
               INNER JOIN categories c ON c.id = p.category_id
               LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 1
               WHERE c.slug = ?
               ORDER BY p.created_at DESC'
          );
          $stmt->execute([$category]);
      } else {
          $stmt = db()->query(
              'SELECT p.*, c.name AS category_name, c.slug AS category_slug, pi.image_path AS cover_image
               FROM products p
               INNER JOIN categories c ON c.id = p.category_id
               LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 1
               ORDER BY p.created_at DESC'
          );
      }
      $products = $stmt->fetchAll();
      ?>
      <section class="section-head reveal">
        <h2>Loja</h2>
        <form method="get" class="inline-form">
          <input type="hidden" name="page" value="shop">
          <select name="category">
            <option value="">Todas as categorias</option>
            <?php foreach ($categories as $categoryOption): ?>
              <option value="<?= e($categoryOption['slug']) ?>" <?= $category === $categoryOption['slug'] ? 'selected' : '' ?>>
                <?= e($categoryOption['name']) ?>
              </option>
            <?php endforeach; ?>
          </select>
          <button class="btn btn-sm" type="submit">Filtrar</button>
        </form>
      </section>
      <section class="grid-3 shop-grid">
        <?php foreach ($products as $product): ?>
          <article class="product-card reveal">
            <div class="product-card-media">
              <?php
              $coverImage = $product['cover_image'] ?? $product['image'] ?? null;
              ?>
              <?php if (!empty($coverImage)): ?>
                <img src="/uploads/<?= e((string) $coverImage) ?>" alt="<?= e($product['name']) ?>">
              <?php else: ?>
                <div class="product-card-placeholder">Sem imagem</div>
              <?php endif; ?>
            </div>
            <div class="product-card-body">
              <span class="product-card-category"><?= e($product['category_name'] ?? 'Categoria') ?></span>
              <h3><?= e($product['name']) ?></h3>
              <p><?= e($product['description']) ?></p>
              <div class="product-card-footer">
                <p class="price"><?= money_br((float) $product['price']) ?></p>
                <div class="product-card-actions">
                  <a class="btn btn-light btn-sm" href="<?= e(app_url('?page=product&id=' . (int) $product['id'])) ?>">Detalhes</a>
                  <form method="post" class="inline-form" style="margin:0;">
                    <?= csrf_input() ?>
                    <input type="hidden" name="action" value="add_to_cart">
                    <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                    <input type="hidden" name="quantity" value="1">
                    <button type="submit" class="link-adicionar">Adicionar</button>
                  </form>
                </div>
              </div>
            </div>
          </article>
        <?php endforeach; ?>
      </section>
    <?php endif; ?>

    <?php if ($page === 'product'): ?>
      <?php
      $id = (int) ($_GET['id'] ?? 0);
      $stmt = db()->prepare(
          'SELECT p.*, c.name AS category_name, c.slug AS category_slug
           FROM products p
           LEFT JOIN categories c ON c.id = p.category_id
           WHERE p.id = ? LIMIT 1'
      );
      $stmt->execute([$id]);
      $product = $stmt->fetch();
      $productImages = $product ? fetch_product_images((int) $product['id']) : [];
      if ($product && $productImages === [] && !empty($product['image'])) {
          $productImages[] = [
              'id' => 0,
              'image_path' => $product['image'],
              'sort_order' => 1,
          ];
      }
      ?>
      <?php if (!$product): ?>
        <p class="reveal">Produto não encontrado.</p>
      <?php else: ?>
        <section class="product-detail">
          <div class="reveal">
            <?php if ($productImages !== []): ?>
              <?php
              $mainImage = (string) $productImages[0]['image_path'];
              ?>
              <div class="product-gallery" data-gallery>
                <img class="product-gallery-main" src="/uploads/<?= e($mainImage) ?>" alt="<?= e($product['name']) ?>" data-gallery-main>
                <?php if (count($productImages) > 1): ?>
                  <div class="product-gallery-thumbs">
                    <?php foreach ($productImages as $index => $image): ?>
                      <button
                        type="button"
                        class="product-gallery-thumb<?= $index === 0 ? ' is-active' : '' ?>"
                        data-gallery-thumb
                        data-image-src="/uploads/<?= e($image['image_path']) ?>"
                        aria-label="Ver imagem <?= $index + 1 ?>"
                      >
                        <img src="/uploads/<?= e($image['image_path']) ?>" alt="<?= e($product['name']) ?>">
                      </button>
                    <?php endforeach; ?>
                  </div>
                <?php endif; ?>
              </div>
            <?php else: ?>
              <div class="product-card-placeholder">Sem imagem</div>
            <?php endif; ?>
          </div>
          <div class="reveal">
            <p class="eyebrow" style="margin-bottom:8px;"><?= e($product['category_name'] ?? 'Categoria') ?></p>
            <h2><?= e($product['name']) ?></h2>
            <p><?= nl2br(e($product['description'])) ?></p>
            <p class="price"><?= money_br((float) $product['price']) ?></p>
            <form method="post" class="inline-form">
              <?= csrf_input() ?>
              <input type="hidden" name="action" value="add_to_cart">
              <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
              <input type="number" name="quantity" value="1" min="1">
              <button class="btn" type="submit">Adicionar ao carrinho</button>
            </form>
          </div>
        </section>
      <?php endif; ?>
    <?php endif; ?>

    <?php if ($page === 'cart'): ?>
      <?php
      $cart = $_SESSION['cart'];
      $products = [];
      if ($cart !== []) {
          $ids = array_keys($cart);
          $placeholder = implode(',', array_fill(0, count($ids), '?'));
          $stmt = db()->prepare("SELECT id, name, price FROM products WHERE id IN ($placeholder)");
          $stmt->execute($ids);
          $products = $stmt->fetchAll();
      }
      $total = 0.0;
      ?>
      <h2 class="reveal">Carrinho</h2>
      <?php if ($products === []): ?>
        <p class="reveal">Seu carrinho está vazio.</p>
      <?php else: ?>
        <form method="post" class="reveal">
          <?= csrf_input() ?>
          <input type="hidden" name="action" value="update_cart">
          <table class="table">
            <thead><tr><th>Produto</th><th>Qtd</th><th>Preço</th><th>Subtotal</th></tr></thead>
            <tbody>
              <?php foreach ($products as $product): ?>
                <?php
                $qty = (int) ($cart[(int) $product['id']] ?? 1);
                $subtotal = $qty * (float) $product['price'];
                $total += $subtotal;
                ?>
                <tr>
                  <td><?= e($product['name']) ?></td>
                  <td><input type="number" min="0" name="qty[<?= (int) $product['id'] ?>]" value="<?= $qty ?>"></td>
                  <td><?= money_br((float) $product['price']) ?></td>
                  <td><?= money_br($subtotal) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
          <button class="btn btn-sm" type="submit">Atualizar carrinho</button>
        </form>

        <h3 class="reveal">Total: <?= money_br($total) ?></h3>
        <h3 class="reveal">Finalizar pedido</h3>
        <form method="post" class="checkout-form reveal">
          <?= csrf_input() ?>
          <input type="hidden" name="action" value="checkout">
          <label>Nome <input type="text" name="customer_name" required></label>
          <label>Email <input type="email" name="customer_email" required></label>
          <label>Telefone <input type="text" name="customer_phone" required></label>
          <label>Observações <textarea name="notes"></textarea></label>
          <button class="btn" type="submit">Enviar pedido</button>
        </form>
      <?php endif; ?>
    <?php endif; ?>

    <?php if ($page === 'about'): ?>
      <?php $about = fetch_about_content(); ?>
      <section class="about-wrap">
        <div class="reveal">
          <h2>Quem Somos</h2>
          <p><?= nl2br(e($about['content'])) ?></p>
        </div>
        <div class="reveal">
          <?php if (!empty($about['image'])): ?>
            <img src="/uploads/<?= e($about['image']) ?>" alt="Equipe Alma Marcenaria">
          <?php endif; ?>
        </div>
      </section>
    <?php endif; ?>

    <?php if ($page === 'contact'): ?>
      <h2 class="reveal">Contato</h2>
      <form method="post" class="checkout-form reveal">
        <?= csrf_input() ?>
        <input type="hidden" name="action" value="contact_form">
        <label>Nome <input type="text" name="name" required></label>
        <label>Email <input type="email" name="email" required></label>
        <label>Mensagem <textarea name="message" required></textarea></label>
        <button class="btn" type="submit">Enviar mensagem</button>
      </form>
    <?php endif; ?>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <h3>Alma Marcenaria</h3>
        <p>Móveis sob medida, decoração e marcenaria autoral.<br>Produção em São Paulo e envios sob consulta.</p>
      </div>
      <div class="footer-links">
        <div class="footer-links-row">
          <a href="#">Termos de serviço</a>
          <a href="<?= e(app_url('?page=about')) ?>">Quem somos</a>
          <a href="<?= e($whatsappUrl) ?>" target="_blank" rel="noopener noreferrer">Contato</a>
        </div>
        <div class="footer-social" aria-label="Redes sociais">
          <a href="https://www.instagram.com/alma.marcenaria/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5"></rect>
              <circle cx="12" cy="12" r="4"></circle>
              <circle cx="17.3" cy="6.7" r="0.8" fill="currentColor" stroke="none"></circle>
            </svg>
          </a>
          <a href="<?= e($whatsappUrl) ?>" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
              <path d="M20 11.5A8.5 8.5 0 0 1 7.4 19l-3.4 1 1.1-3.2A8.5 8.5 0 1 1 20 11.5Z"></path>
              <path d="M9.4 9.6c.2-.4.5-.4.7-.4.2 0 .4 0 .5.4.2.4.6 1.3.6 1.4.1.1.1.3 0 .4-.1.2-.2.3-.4.4-.2.2-.3.3-.1.6.2.3.8 1.2 1.9 1.6.3.1.5.1.7-.1.2-.2.4-.5.6-.4.2 0 1.3.6 1.6.7.2.1.3.2.3.4 0 .2-.1.9-.6 1.2-.5.3-1.2.3-2 .1-1.9-.6-3.5-2.2-4.1-4-.2-.8-.1-1.5.3-2.3Z"></path>
            </svg>
          </a>
        </div>
        <p class="footer-copy">© <?= date('Y') ?> Alma Marcenaria. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
  <script src="/public/assets/site.js" defer></script>
</body>
</html>
