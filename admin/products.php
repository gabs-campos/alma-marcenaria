<?php
declare(strict_types=1);
require_once __DIR__ . '/_header.php';

if (is_post()) {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect('/admin/products.php');
    }

    $action = $_POST['action'] ?? '';
    if ($action === 'delete') {
        $id = (int) ($_POST['id'] ?? 0);
        $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);
        flash('success', 'Produto removido.');
        redirect('/admin/products.php');
    }

    $name = trim((string) ($_POST['name'] ?? ''));
    $description = trim((string) ($_POST['description'] ?? ''));
    $price = (float) ($_POST['price'] ?? 0);
    $category = trim((string) ($_POST['category'] ?? 'sob-medida'));
    $id = (int) ($_POST['id'] ?? 0);

    if ($name === '' || $price <= 0) {
        flash('error', 'Nome e preço são obrigatórios.');
        redirect('/admin/products.php');
    }

    $uploadError = validate_image_upload($_FILES['image'] ?? []);
    if ($uploadError !== null) {
        flash('error', $uploadError);
        redirect('/admin/products.php');
    }

    $newImage = store_uploaded_image($_FILES['image'] ?? []);
    if ($id > 0) {
        if ($newImage) {
            $stmt = db()->prepare(
                'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, updated_at = NOW() WHERE id = ?'
            );
            $stmt->execute([$name, $description, $price, $category, $newImage, $id]);
        } else {
            $stmt = db()->prepare(
                'UPDATE products SET name = ?, description = ?, price = ?, category = ?, updated_at = NOW() WHERE id = ?'
            );
            $stmt->execute([$name, $description, $price, $category, $id]);
        }
        flash('success', 'Produto atualizado.');
    } else {
        $stmt = db()->prepare(
            'INSERT INTO products (name, description, price, category, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())'
        );
        $stmt->execute([$name, $description, $price, $category, $newImage]);
        flash('success', 'Produto criado.');
    }
    redirect('/admin/products.php');
}

$edit = null;
if (isset($_GET['edit'])) {
    $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([(int) $_GET['edit']]);
    $edit = $stmt->fetch();
}

$products = db()->query('SELECT * FROM products ORDER BY created_at DESC')->fetchAll();
?>
<section class="section-head">
  <h1>Produtos</h1>
</section>

<form method="post" enctype="multipart/form-data" class="checkout-form" style="max-width:760px;">
  <?= csrf_input() ?>
  <input type="hidden" name="id" value="<?= (int) ($edit['id'] ?? 0) ?>">
  <label>Nome <input type="text" name="name" value="<?= e($edit['name'] ?? '') ?>" required></label>
  <label>Descrição <textarea name="description"><?= e($edit['description'] ?? '') ?></textarea></label>
  <label>Preço <input type="number" step="0.01" min="0.01" name="price" value="<?= e((string) ($edit['price'] ?? '')) ?>" required></label>
  <label>Categoria
    <select name="category">
      <?php $cat = $edit['category'] ?? 'sob-medida'; ?>
      <option value="sob-medida" <?= $cat === 'sob-medida' ? 'selected' : '' ?>>Sob medida</option>
      <option value="pronta-entrega" <?= $cat === 'pronta-entrega' ? 'selected' : '' ?>>Pronta entrega</option>
    </select>
  </label>
  <label>Imagem do produto <input type="file" name="image" accept=".jpg,.jpeg,.png,.webp"></label>
  <button class="btn" type="submit"><?= $edit ? 'Atualizar produto' : 'Criar produto' ?></button>
</form>

<table class="table" style="margin-top:18px;">
  <thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Ações</th></tr></thead>
  <tbody>
    <?php foreach ($products as $product): ?>
      <tr>
        <td><?= e($product['name']) ?></td>
        <td><?= e($product['category']) ?></td>
        <td><?= money_br((float) $product['price']) ?></td>
        <td>
          <a class="btn btn-sm btn-light" href="/admin/products.php?edit=<?= (int) $product['id'] ?>">Editar</a>
          <form method="post" style="display:inline;">
            <?= csrf_input() ?>
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= (int) $product['id'] ?>">
            <button class="btn btn-sm" onclick="return confirm('Remover produto?')" type="submit">Excluir</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>

<?php require_once __DIR__ . '/_footer.php'; ?>
