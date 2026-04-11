<?php
declare(strict_types=1);
require_once __DIR__ . '/_header.php';

if (is_post()) {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect('/admin/about.php');
    }

    $content = trim((string) ($_POST['content'] ?? ''));
    if ($content === '') {
        flash('error', 'Conteúdo não pode ficar vazio.');
        redirect('/admin/about.php');
    }

    $uploadError = validate_image_upload($_FILES['image'] ?? []);
    if ($uploadError !== null) {
        flash('error', $uploadError);
        redirect('/admin/about.php');
    }

    $newImage = store_uploaded_image($_FILES['image'] ?? []);
    $row = db()->query('SELECT id, image FROM about LIMIT 1')->fetch();
    if ($row) {
        if ($newImage) {
            $stmt = db()->prepare('UPDATE about SET content = ?, image = ?, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$content, $newImage, (int) $row['id']]);
        } else {
            $stmt = db()->prepare('UPDATE about SET content = ?, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$content, (int) $row['id']]);
        }
    } else {
        $stmt = db()->prepare('INSERT INTO about (content, image, updated_at) VALUES (?, ?, NOW())');
        $stmt->execute([$content, $newImage]);
    }

    flash('success', 'Página "Quem Somos" atualizada.');
    redirect('/admin/about.php');
}

$about = fetch_about_content();
?>
<h1 class="reveal">Editar "Quem Somos"</h1>
<form method="post" enctype="multipart/form-data" class="checkout-form reveal" style="max-width:760px;">
  <?= csrf_input() ?>
  <label>Texto institucional
    <textarea name="content" rows="10" required><?= e($about['content'] ?? '') ?></textarea>
  </label>
  <label>Imagem institucional
    <input type="file" name="image" accept=".jpg,.jpeg,.png,.webp">
  </label>
  <button class="btn" type="submit">Salvar alterações</button>
</form>
<?php if (!empty($about['image'])): ?>
  <div style="margin-top:16px;max-width:420px;">
    <img src="/uploads/<?= e($about['image']) ?>" alt="Imagem Quem Somos">
  </div>
<?php endif; ?>
<?php require_once __DIR__ . '/_footer.php'; ?>
