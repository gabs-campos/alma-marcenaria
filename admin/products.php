<?php
declare(strict_types=1);
require_once __DIR__ . '/_header.php';

function extract_uploaded_images(array $files): array
{
    if (!isset($files['name']) || !is_array($files['name'])) {
        return [];
    }

    $images = [];
    $total = count($files['name']);
    for ($i = 0; $i < $total; $i++) {
        $images[] = [
            'name' => $files['name'][$i] ?? '',
            'type' => $files['type'][$i] ?? '',
            'tmp_name' => $files['tmp_name'][$i] ?? '',
            'error' => $files['error'][$i] ?? UPLOAD_ERR_NO_FILE,
            'size' => $files['size'][$i] ?? 0,
        ];
    }

    return $images;
}

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
    $categoryId = (int) ($_POST['category_id'] ?? 0);
    $id = (int) ($_POST['id'] ?? 0);

    if ($name === '' || $price <= 0 || $categoryId <= 0) {
        flash('error', 'Nome, preço e categoria são obrigatórios.');
        redirect('/admin/products.php');
    }

    $categoryStmt = db()->prepare('SELECT id, name, slug FROM categories WHERE id = ? LIMIT 1');
    $categoryStmt->execute([$categoryId]);
    $category = $categoryStmt->fetch();
    if (!$category) {
        flash('error', 'Categoria inválida.');
        redirect('/admin/products.php');
    }

    $removeImageIds = array_map('intval', $_POST['remove_images'] ?? []);
    $existingOrderInput = $_POST['existing_order'] ?? [];
    $newImages = extract_uploaded_images($_FILES['new_images'] ?? []);

    $pdo = db();
    $pdo->beginTransaction();
    try {
        $existingImages = [];
        if ($id > 0) {
            $checkStmt = $pdo->prepare('SELECT id FROM products WHERE id = ? LIMIT 1');
            $checkStmt->execute([$id]);
            if (!$checkStmt->fetch()) {
                throw new RuntimeException('Produto não encontrado.');
            }

            $existingImages = fetch_product_images($id);
            $updateStmt = $pdo->prepare(
                'UPDATE products
                 SET name = ?, description = ?, price = ?, category_id = ?, category = ?, updated_at = NOW()
                 WHERE id = ?'
            );
            $updateStmt->execute([$name, $description, $price, $category['id'], $category['slug'], $id]);
        } else {
            $insertStmt = $pdo->prepare(
                'INSERT INTO products (name, description, price, category_id, category, image, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, NULL, NOW(), NOW())'
            );
            $insertStmt->execute([$name, $description, $price, $category['id'], $category['slug']]);
            $id = (int) $pdo->lastInsertId();
        }

        $keptImages = [];
        foreach ($existingImages as $imageRow) {
            $imageId = (int) $imageRow['id'];
            if (in_array($imageId, $removeImageIds, true)) {
                continue;
            }
            $keptImages[] = $imageRow;
        }

        usort($keptImages, static function (array $a, array $b) use ($existingOrderInput): int {
            $aId = (int) $a['id'];
            $bId = (int) $b['id'];
            $aOrder = (int) ($existingOrderInput[(string) $aId] ?? $a['sort_order']);
            $bOrder = (int) ($existingOrderInput[(string) $bId] ?? $b['sort_order']);
            if ($aOrder === $bOrder) {
                return $aId <=> $bId;
            }
            return $aOrder <=> $bOrder;
        });

        $newImagePaths = [];
        foreach ($newImages as $newImage) {
            if (($newImage['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                continue;
            }

            $uploadError = validate_image_upload($newImage);
            if ($uploadError !== null) {
                throw new RuntimeException($uploadError);
            }

            $stored = store_uploaded_image($newImage);
            if ($stored === null) {
                throw new RuntimeException('Falha ao salvar uma das imagens.');
            }
            $newImagePaths[] = $stored;
        }

        $finalImages = array_map(static fn (array $row): string => (string) $row['image_path'], $keptImages);
        foreach ($newImagePaths as $path) {
            $finalImages[] = $path;
        }

        if (count($finalImages) > 3) {
            throw new RuntimeException('Cada produto pode ter no máximo 3 imagens.');
        }

        $deleteImagesStmt = $pdo->prepare('DELETE FROM product_images WHERE product_id = ?');
        $deleteImagesStmt->execute([$id]);

        $insertImageStmt = $pdo->prepare(
            'INSERT INTO product_images (product_id, image_path, sort_order, created_at) VALUES (?, ?, ?, NOW())'
        );
        foreach ($finalImages as $index => $imagePath) {
            $insertImageStmt->execute([$id, $imagePath, $index + 1]);
        }

        $coverImage = $finalImages[0] ?? null;
        $coverStmt = $pdo->prepare('UPDATE products SET image = ?, updated_at = NOW() WHERE id = ?');
        $coverStmt->execute([$coverImage, $id]);

        $pdo->commit();
        flash('success', isset($_POST['id']) && (int) $_POST['id'] > 0 ? 'Produto atualizado.' : 'Produto criado.');
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        flash('error', $e instanceof RuntimeException ? $e->getMessage() : 'Não foi possível salvar o produto.');
    }

    redirect('/admin/products.php');
}

$edit = null;
$editImages = [];
if (isset($_GET['edit'])) {
    $stmt = db()->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
    $stmt->execute([(int) $_GET['edit']]);
    $edit = $stmt->fetch();
    if ($edit) {
        $editImages = fetch_product_images((int) $edit['id']);
    }
}

$categories = fetch_categories();
$products = db()->query(
    'SELECT p.*, c.name AS category_name, c.slug AS category_slug, pi.image_path AS cover_image, COALESCE(pic.images_count, 0) AS images_count
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 1
     LEFT JOIN (
       SELECT product_id, COUNT(*) AS images_count
       FROM product_images
       GROUP BY product_id
     ) pic ON pic.product_id = p.id
     ORDER BY p.created_at DESC'
)->fetchAll();
?>
<section class="section-head reveal">
  <h1>Produtos</h1>
</section>

<?php if ($categories === []): ?>
  <div class="alert alert-error">Cadastre ao menos uma categoria em <a href="/admin/categories.php">Categorias</a> antes de criar produtos.</div>
<?php endif; ?>

<form method="post" enctype="multipart/form-data" class="checkout-form reveal" style="max-width:760px;">
  <?= csrf_input() ?>
  <input type="hidden" name="id" value="<?= (int) ($edit['id'] ?? 0) ?>">
  <label>Nome <input type="text" name="name" value="<?= e($edit['name'] ?? '') ?>" required></label>
  <label>Descrição <textarea name="description"><?= e($edit['description'] ?? '') ?></textarea></label>
  <label>Preço <input type="number" step="0.01" min="0.01" name="price" value="<?= e((string) ($edit['price'] ?? '')) ?>" required></label>
  <label>Categoria
    <select name="category_id" required>
      <option value="">Selecione</option>
      <?php
      $selectedCategory = (int) ($edit['category_id'] ?? 0);
      foreach ($categories as $categoryOption):
      ?>
        <option value="<?= (int) $categoryOption['id'] ?>" <?= $selectedCategory === (int) $categoryOption['id'] ? 'selected' : '' ?>>
          <?= e($categoryOption['name']) ?>
        </option>
      <?php endforeach; ?>
    </select>
  </label>
  <?php if ($edit && $editImages !== []): ?>
    <div>
      <strong>Galeria atual</strong>
      <div style="display:grid;gap:10px;margin-top:10px;">
        <?php foreach ($editImages as $image): ?>
          <label style="display:grid;gap:8px;padding:10px;border:1px solid rgba(var(--accent-rgb), 0.24);border-radius:12px;">
            <img src="/uploads/<?= e($image['image_path']) ?>" alt="Imagem do produto" style="width:120px;height:90px;object-fit:cover;border-radius:10px;">
            <span>Ordem
              <select name="existing_order[<?= (int) $image['id'] ?>]">
                <option value="1" <?= (int) $image['sort_order'] === 1 ? 'selected' : '' ?>>1</option>
                <option value="2" <?= (int) $image['sort_order'] === 2 ? 'selected' : '' ?>>2</option>
                <option value="3" <?= (int) $image['sort_order'] === 3 ? 'selected' : '' ?>>3</option>
              </select>
            </span>
            <span><input type="checkbox" name="remove_images[]" value="<?= (int) $image['id'] ?>"> Remover imagem</span>
          </label>
        <?php endforeach; ?>
      </div>
    </div>
  <?php endif; ?>
  <label>Adicionar imagens (até completar 3 no total)
    <input type="file" name="new_images[]" accept=".jpg,.jpeg,.png,.webp" multiple>
  </label>
  <button class="btn" type="submit" <?= $categories === [] ? 'disabled' : '' ?>><?= $edit ? 'Atualizar produto' : 'Criar produto' ?></button>
</form>

<table class="table reveal" style="margin-top:18px;">
  <thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Imagens</th><th>Ações</th></tr></thead>
  <tbody>
    <?php foreach ($products as $product): ?>
      <tr>
        <td><?= e($product['name']) ?></td>
        <td><?= e($product['category_name'] ?? $product['category']) ?></td>
        <td><?= money_br((float) $product['price']) ?></td>
        <td><?= (int) $product['images_count'] ?></td>
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
