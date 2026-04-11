<?php
declare(strict_types=1);
require_once __DIR__ . '/_header.php';

if (is_post()) {
    if (!csrf_validate()) {
        flash('error', 'Token CSRF inválido.');
        redirect('/admin/users.php');
    }

    $email = trim((string) ($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        flash('error', 'Informe um email válido.');
        redirect('/admin/users.php');
    }

    if (strlen($password) < 8) {
        flash('error', 'A senha deve ter no mínimo 8 caracteres.');
        redirect('/admin/users.php');
    }

    $existsStmt = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $existsStmt->execute([$email]);
    if ($existsStmt->fetch()) {
        flash('error', 'Já existe um administrador com este email.');
        redirect('/admin/users.php');
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $insertStmt = db()->prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, NOW())');
    $insertStmt->execute([$email, $hash]);

    flash('success', 'Novo administrador criado com sucesso.');
    redirect('/admin/users.php');
}

$users = db()->query('SELECT id, email, created_at FROM users ORDER BY created_at DESC')->fetchAll();
?>
<h1 class="reveal">Administradores</h1>

<form method="post" class="checkout-form reveal" style="max-width:760px;">
  <?= csrf_input() ?>
  <label>Email do novo administrador
    <input type="email" name="email" required>
  </label>
  <label>Senha do novo administrador
    <input type="password" name="password" minlength="8" required>
  </label>
  <button class="btn" type="submit">Criar administrador</button>
</form>

<table class="table reveal" style="margin-top:18px;">
  <thead>
    <tr>
      <th>ID</th>
      <th>Email</th>
      <th>Criado em</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($users as $user): ?>
      <tr>
        <td><?= (int) $user['id'] ?></td>
        <td><?= e($user['email']) ?></td>
        <td><?= e($user['created_at']) ?></td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>

<?php require_once __DIR__ . '/_footer.php'; ?>
