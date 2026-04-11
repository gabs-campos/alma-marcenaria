<?php
declare(strict_types=1);
require_once __DIR__ . '/_header.php';

if (is_post()) {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect('/admin/categories.php');
    }

    $action = $_POST['action'] ?? 'save';
    if ($action === 'delete') {
        $id = (int) ($_POST['id'] ?? 0);
        $countStmt = db()->prepare('SELECT COUNT(*) FROM products WHERE category_id = ?');
        $countStmt->execute([$id]);
        $productsUsing = (int) $countStmt->fetchColumn();

        if ($productsUsing > 0) {
            flash('error', 'Esta categoria está em uso por produtos e não pode ser removida.');
            redirect('/admin/categories.php');
        }

        $deleteStmt = db()->prepare('DELETE FROM categories WHERE id = ?');
        $deleteStmt->execute([$id]);
        flash('success', 'Categoria removida.');
        redirect('/admin/categories.php');
    }

    $id = (int) ($_POST['id'] ?? 0);
    $name = trim((string) ($_POST['name'] ?? ''));
    if ($name === '') {
        flash('error', 'Informe o nome da categoria.');
        redirect('/admin/categories.php');
    }

    $slug = slugify($name);
    if ($slug === '') {
        flash('error', 'Não foi possível gerar um identificador válido para a categoria.');
        redirect('/admin/categories.php');
    }

    $existsStmt = db()->prepare('SELECT id FROM categories WHERE slug = ? AND id <> ? LIMIT 1');
    $existsStmt->execute([$slug, $id]);
    if ($existsStmt->fetch()) {
        flash('error', 'Já existe uma categoria com nome semelhante.');
        redirect('/admin/categories.php');
    }

    if ($id > 0) {
        $stmt = db()->prepare('UPDATE categories SET name = ?, slug = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$name, $slug, $id]);
        flash('success', 'Categoria atualizada.');
    } else {
        $stmt = db()->prepare('INSERT INTO categories (name, slug, created_at, updated_at) VALUES (?, ?, NOW(), NOW())');
        $stmt->execute([$name, $slug]);
        flash('success', 'Categoria criada.');
    }

    redirect('/admin/categories.php');
}

$edit = null;
if (isset($_GET['edit'])) {
    $stmt = db()->prepare('SELECT id, name, slug FROM categories WHERE id = ? LIMIT 1');
    $stmt->execute([(int) $_GET['edit']]);
    $edit = $stmt->fetch();
}

$categories = db()->query(
    'SELECT c.id, c.name, c.slug, c.updated_at, COUNT(p.id) AS products_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id, c.name, c.slug, c.updated_at
     ORDER BY c.name ASC'
)->fetchAll();
?>
<section class="section-head reveal">
  <h1>Categorias</h1>
</section>

<form method="post" class="checkout-form reveal" style="max-width:760px;">
  <?= csrf_input() ?>
  <input type="hidden" name="id" value="<?= (int) ($edit['id'] ?? 0) ?>">
  <label>Nome da categoria
    <input type="text" name="name" value="<?= e($edit['name'] ?? '') ?>" required>
  </label>
  <button class="btn" type="submit"><?= $edit ? 'Atualizar categoria' : 'Criar categoria' ?></button>
</form>

<table class="table reveal" style="margin-top:18px;">
  <thead>
    <tr>
      <th>Nome</th>
      <th>Slug</th>
      <th>Produtos vinculados</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($categories as $category): ?>
      <tr>
        <td><?= e($category['name']) ?></td>
        <td><?= e($category['slug']) ?></td>
        <td><?= (int) $category['products_count'] ?></td>
        <td>
          <a class="btn btn-sm btn-light" href="/admin/categories.php?edit=<?= (int) $category['id'] ?>">Editar</a>
          <form method="post" style="display:inline;">
            <?= csrf_input() ?>
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= (int) $category['id'] ?>">
            <button class="btn btn-sm" onclick="return confirm('Remover categoria?')" type="submit">Excluir</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>

<?php require_once __DIR__ . '/_footer.php'; ?>
