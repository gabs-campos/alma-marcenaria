<?php
declare(strict_types=1);

function send_html_email(string $subject, string $html): bool
{
    global $config;
    $mail = $config['mail'];

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $mail['from_name'] . ' <' . $mail['from_email'] . '>',
        'Reply-To: ' . $mail['from_email'],
    ];

    return mail(
        $mail['to_email'],
        '=?UTF-8?B?' . base64_encode($subject) . '?=',
        $html,
        implode("\r\n", $headers)
    );
}
