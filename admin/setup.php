<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

$existing = (int) db()->query('SELECT COUNT(*) FROM users')->fetchColumn();
if ($existing > 0) {
    flash('error', 'Usuário admin já existe. Faça login.');
    redirect('/admin/index.php');
}

if (is_post()) {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect('/admin/setup.php');
    }

    $email = trim((string) ($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
        flash('error', 'Use email válido e senha com pelo menos 8 caracteres.');
        redirect('/admin/setup.php');
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = db()->prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, NOW())');
    $stmt->execute([$email, $hash]);

    flash('success', 'Usuário admin criado. Faça login.');
    redirect('/admin/index.php');
}

$messages = consume_flash();
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Setup Admin</title>
  <link rel="stylesheet" href="/public/assets/styles.css">
</head>
<body>
  <main class="container" style="max-width:560px;padding-top:60px;">
    <h1>Setup inicial do admin</h1>
    <?php foreach ($messages as $msg): ?>
      <div class="alert alert-<?= e($msg['type']) ?>"><?= e($msg['message']) ?></div>
    <?php endforeach; ?>
    <form method="post" class="checkout-form">
      <?= csrf_input() ?>
      <label>Email admin <input type="email" name="email" required></label>
      <label>Senha admin <input type="password" name="password" minlength="8" required></label>
      <button class="btn" type="submit">Criar usuário</button>
    </form>
  </main>
</body>
</html>
