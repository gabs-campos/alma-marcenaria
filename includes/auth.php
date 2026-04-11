<?php
declare(strict_types=1);

function admin_logged_in(): bool
{
    return isset($_SESSION['admin_user_id']);
}

function admin_require_auth(): void
{
    if (!admin_logged_in()) {
        redirect('/admin/index.php');
    }
}

function admin_login(string $email, string $password): bool
{
    $stmt = db()->prepare('SELECT id, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        return false;
    }

    if (!password_verify($password, $user['password_hash'])) {
        return false;
    }

    $_SESSION['admin_user_id'] = (int) $user['id'];
    return true;
}

function admin_logout(): void
{
    unset($_SESSION['admin_user_id']);
}
