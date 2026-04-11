<?php
declare(strict_types=1);
require_once __DIR__ . '/_header.php';

if (is_post()) {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect('/admin/home.php');
    }

    $heroEyebrow = trim((string) ($_POST['hero_eyebrow'] ?? ''));
    $heroTitle = trim((string) ($_POST['hero_title'] ?? ''));
    $heroDescription = trim((string) ($_POST['hero_description'] ?? ''));
    $heroImageCaption = trim((string) ($_POST['hero_image_caption'] ?? ''));
    $feature1Title = trim((string) ($_POST['feature_1_title'] ?? ''));
    $feature1Description = trim((string) ($_POST['feature_1_description'] ?? ''));
    $feature2Title = trim((string) ($_POST['feature_2_title'] ?? ''));
    $feature2Description = trim((string) ($_POST['feature_2_description'] ?? ''));
    $feature3Title = trim((string) ($_POST['feature_3_title'] ?? ''));
    $feature3Description = trim((string) ($_POST['feature_3_description'] ?? ''));

    if (
        $heroEyebrow === '' || $heroTitle === '' || $heroDescription === '' ||
        $feature1Title === '' || $feature1Description === '' ||
        $feature2Title === '' || $feature2Description === '' ||
        $feature3Title === '' || $feature3Description === ''
    ) {
        flash('error', 'Preencha todos os textos obrigatórios da Home.');
        redirect('/admin/home.php');
    }

    $uploadError = validate_image_upload($_FILES['hero_image'] ?? []);
    if ($uploadError !== null) {
        flash('error', $uploadError);
        redirect('/admin/home.php');
    }

    $newImage = store_uploaded_image($_FILES['hero_image'] ?? []);
    $row = db()->query('SELECT id, hero_image FROM home_content LIMIT 1')->fetch();
    if ($row) {
        if ($newImage) {
            $stmt = db()->prepare(
                'UPDATE home_content SET hero_eyebrow = ?, hero_title = ?, hero_description = ?, hero_image = ?, hero_image_caption = ?,
                 feature_1_title = ?, feature_1_description = ?, feature_2_title = ?, feature_2_description = ?, feature_3_title = ?, feature_3_description = ?,
                 updated_at = NOW() WHERE id = ?'
            );
            $stmt->execute([
                $heroEyebrow, $heroTitle, $heroDescription, $newImage, $heroImageCaption,
                $feature1Title, $feature1Description, $feature2Title, $feature2Description, $feature3Title, $feature3Description,
                (int) $row['id'],
            ]);
        } else {
            $stmt = db()->prepare(
                'UPDATE home_content SET hero_eyebrow = ?, hero_title = ?, hero_description = ?, hero_image_caption = ?,
                 feature_1_title = ?, feature_1_description = ?, feature_2_title = ?, feature_2_description = ?, feature_3_title = ?, feature_3_description = ?,
                 updated_at = NOW() WHERE id = ?'
            );
            $stmt->execute([
                $heroEyebrow, $heroTitle, $heroDescription, $heroImageCaption,
                $feature1Title, $feature1Description, $feature2Title, $feature2Description, $feature3Title, $feature3Description,
                (int) $row['id'],
            ]);
        }
    } else {
        $stmt = db()->prepare(
            'INSERT INTO home_content (
                hero_eyebrow, hero_title, hero_description, hero_image, hero_image_caption,
                feature_1_title, feature_1_description, feature_2_title, feature_2_description, feature_3_title, feature_3_description, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
        );
        $stmt->execute([
            $heroEyebrow, $heroTitle, $heroDescription, $newImage, $heroImageCaption,
            $feature1Title, $feature1Description, $feature2Title, $feature2Description, $feature3Title, $feature3Description,
        ]);
    }

    flash('success', 'Conteúdo da Home atualizado.');
    redirect('/admin/home.php');
}

$home = fetch_home_content();
?>
<h1>Editar página inicial</h1>
<form method="post" enctype="multipart/form-data" class="checkout-form" style="max-width:900px;">
  <?= csrf_input() ?>
  <label>Eyebrow da Home
    <input type="text" name="hero_eyebrow" maxlength="190" value="<?= e($home['hero_eyebrow']) ?>" required>
  </label>
  <label>Título principal
    <input type="text" name="hero_title" maxlength="255" value="<?= e($home['hero_title']) ?>" required>
  </label>
  <label>Descrição principal
    <textarea name="hero_description" rows="4" required><?= e($home['hero_description']) ?></textarea>
  </label>
  <label>Legenda da imagem principal
    <input type="text" name="hero_image_caption" maxlength="255" value="<?= e($home['hero_image_caption']) ?>">
  </label>
  <label>Imagem principal da Home
    <input type="file" name="hero_image" accept=".jpg,.jpeg,.png,.webp">
  </label>

  <hr>
  <label>Card 1 - Título
    <input type="text" name="feature_1_title" maxlength="120" value="<?= e($home['feature_1_title']) ?>" required>
  </label>
  <label>Card 1 - Descrição
    <textarea name="feature_1_description" rows="3" required><?= e($home['feature_1_description']) ?></textarea>
  </label>

  <label>Card 2 - Título
    <input type="text" name="feature_2_title" maxlength="120" value="<?= e($home['feature_2_title']) ?>" required>
  </label>
  <label>Card 2 - Descrição
    <textarea name="feature_2_description" rows="3" required><?= e($home['feature_2_description']) ?></textarea>
  </label>

  <label>Card 3 - Título
    <input type="text" name="feature_3_title" maxlength="120" value="<?= e($home['feature_3_title']) ?>" required>
  </label>
  <label>Card 3 - Descrição
    <textarea name="feature_3_description" rows="3" required><?= e($home['feature_3_description']) ?></textarea>
  </label>

  <button class="btn" type="submit">Salvar Home</button>
</form>

<?php if (!empty($home['hero_image'])): ?>
  <div style="margin-top:16px;max-width:460px;">
    <img src="/uploads/<?= e($home['hero_image']) ?>" alt="Imagem da Home">
  </div>
<?php endif; ?>

<?php require_once __DIR__ . '/_footer.php'; ?>
