<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

if (admin_logged_in()) {
    redirect('/admin/dashboard.php');
}

if (is_post()) {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect('/admin/index.php');
    }

    $email = trim((string) ($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    if (admin_login($email, $password)) {
        redirect('/admin/dashboard.php');
    }
    flash('error', 'Credenciais inválidas.');
    redirect('/admin/index.php');
}

$messages = consume_flash();
$usersCount = (int) db()->query('SELECT COUNT(*) FROM users')->fetchColumn();
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - Alma Marcenaria</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/public/assets/styles.css">
</head>
<body class="admin">
  <main class="container" style="max-width:460px;padding-top:70px;">
    <h1 class="reveal">Painel Administrativo</h1>
    <?php foreach ($messages as $msg): ?>
      <div class="alert alert-<?= e($msg['type']) ?>"><?= e($msg['message']) ?></div>
    <?php endforeach; ?>
    <form method="post" class="checkout-form reveal">
      <?= csrf_input() ?>
      <label>Email <input type="email" name="email" required></label>
      <label>Senha <input type="password" name="password" required></label>
      <button class="btn" type="submit">Entrar</button>
    </form>
    <?php if ($usersCount === 0): ?>
      <p style="margin-top:16px;color:var(--text-secondary);">Primeiro acesso? <a href="/admin/setup.php">Criar usuário admin</a></p>
    <?php endif; ?>
  </main>
  <script src="/public/assets/site.js" defer></script>
</body>
</html>
