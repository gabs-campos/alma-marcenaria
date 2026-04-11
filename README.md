# Alma Marcenaria Website

Website institucional + loja leve com carrinho e painel administrativo em PHP 8 + MySQL.

## Estrutura

- `public/`: páginas públicas (Home, Loja, Carrinho, Quem Somos, Contato)
- `admin/`: painel administrativo (login, CRUD de produtos, pedidos, conteúdo institucional)
- `includes/`: bootstrap, conexão DB, helpers, auth, CSRF e email
- `config/`: configurações de app, banco e email
- `uploads/`: imagens enviadas via admin
- `schema.sql`: estrutura do banco de dados

## Deploy rápido na Hostinger

1. Crie banco MySQL no painel Hostinger.
2. Importe o arquivo `schema.sql` no phpMyAdmin.
3. Ajuste credenciais em `config/config.php` (db e email).
4. Publique os arquivos no servidor.
5. Acesse `/admin/setup.php` para criar o primeiro usuário admin.
6. Faça login em `/admin/index.php`.

## Deploy e migration automáticos

Scripts adicionados:

- `scripts/deploy.sh`: executa migrations e faz upload FTP.
- `scripts/migrate.php`: aplica arquivos SQL de `migrations/`.
- `config/deploy.env`: variáveis de FTP e banco para deploy.

### Pré-requisitos locais

- PHP 8+
- `lftp` instalado (macOS: `brew install lftp`)

### Como usar

1. Confira as credenciais em `config/deploy.env`.
2. Torne o script executável:
   - `chmod +x scripts/deploy.sh`
3. Rode o deploy:
   - `./scripts/deploy.sh`

Comportamento padrão:

- Roda migrations pendentes antes do upload.
- Faz upload via FTP para `public_html`.
- Não remove arquivos remotos extras (modo seguro).

Flags úteis:

- `DELETE_REMOTE=1 ./scripts/deploy.sh`
  - Remove no servidor arquivos que não existem localmente.
- `RUN_MIGRATIONS=0 ./scripts/deploy.sh`
  - Faz só upload, sem migration.

## Segurança implementada

- Senha admin com `password_hash` (bcrypt).
- Sessão para autenticação do painel admin.
- Tokens CSRF em formulários críticos.
- Prepared statements com PDO em queries.
- Validação básica de upload (tipo e tamanho) e bloqueio de execução PHP em `uploads/`.
