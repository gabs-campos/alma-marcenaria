<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
admin_logout();
flash('success', 'Sessão encerrada.');
redirect('/admin/index.php');
