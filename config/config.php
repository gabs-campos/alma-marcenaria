<?php
declare(strict_types=1);

return [
    'app' => [
        'name' => 'Alma Marcenaria',
        'base_url' => '/public/index.php',
        'admin_url' => '/admin',
    ],
    'db' => [
        'host' => 'auth-db1180.hstgr.io',
        'port' => 3306,
        'database' => 'u338053907_alma',
        'username' => 'u338053907_alma',
        'password' => 'M@rcenari4',
        'charset' => 'utf8mb4',
    ],
    'mail' => [
        'from_email' => 'contato@almarcenaria.com',
        'from_name' => 'Alma Marcenaria',
        'to_email' => 'contato@almarcenaria.com',
        'use_mail_function' => true,
    ],
    'security' => [
        'session_name' => 'alma_session',
    ],
];
