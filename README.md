# Alma Marcenaria

Site (frontend) + API (backend) em um único projeto Next.js (App Router), com foco em **performance** e **SEO**. Inclui loja, carrinho/checkout e um **Admin** simples para CRUD de produtos (Prisma + SQLite).

## Stack

- **Next.js (App Router)**: páginas e rotas em `src/app`
- **Tailwind CSS v4**: estilos em `src/app/globals.css` + `tailwind.config.ts`
- **Prisma + SQLite**: schema em `prisma/schema.prisma`

## Rodando localmente

1) Instale dependências:

```bash
npm install
```

2) Crie o `.env` (use o exemplo):

```bash
cp .env.example .env
```

3) Rode migrations e gere o client do Prisma (na raiz do projeto):

```bash
npx prisma migrate deploy
npx prisma generate
```

Com `DATABASE_URL="file:./dev.db"` no `.env`, o arquivo SQLite fica em **`prisma/dev.db`** (caminhos relativos são em relação à pasta `prisma/`). Se aparecer erro de tabela inexistente no admin, rode de novo `npx prisma migrate deploy`.

4) Inicie o servidor:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Admin (login simples)

- Acesse `"/admin/login"`.
- Credenciais via `.env`:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`

As rotas de escrita do CRUD de produtos (`POST/PATCH/DELETE`) exigem autenticação (cookie de admin) e podem opcionalmente exigir token:

- `ADMIN_API_TOKEN` (se preenchido): envie `Authorization: Bearer <ADMIN_API_TOKEN>`

## Estrutura de diretórios

- `src/app`: páginas (Home, Loja, Carrinho, Checkout, Institucional) e Admin
- `src/app/api`: rotas de API (`/api/products`, `/api/shipping`, `/api/checkout`, `/api/admin/*`)
- `src/components`: componentes de UI
- `prisma/`: schema e migrations

## Deploy na Hostinger (Node)

1) Configure variáveis de ambiente no painel:
- `DATABASE_URL` = `file:./dev.db` (SQLite local)
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL` = URL pública do site

2) Build:

```bash
npm ci
npm run build
```

3) Rodar migrations em produção:

```bash
npx prisma migrate deploy
npx prisma generate
```

4) Start:

```bash
npm run start
```

## Notas

- `/.env*` é ignorado pelo git por padrão (veja `.gitignore`).
- Rotas SEO: `src/app/sitemap.ts` e `src/app/robots.ts`.
