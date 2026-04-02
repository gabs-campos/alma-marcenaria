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

Guia detalhado: [DEPLOY-HOSTINGER.md](./DEPLOY-HOSTINGER.md).

Resumo:

1. Variáveis no painel: `DATABASE_URL=file:./prod.db` (produção na Hostinger), `NEXT_PUBLIC_SITE_URL` com `https://`, admin e R2 — ver [`.env.example`](./.env.example).

2. **Build:** o painel pode travar em **`npm run build`** — neste repo isso já roda Prisma + migrations + `next build`. Para só o Next (sem migrate), use **`npm run build:next`**.

3. **Start (painel Hostinger):** `npm run start -- -p $PORT` — recomendação da Hostinger ([deploy-nextjs](https://github.com/hostinger/deploy-nextjs)); evita **503** por porta. Localmente: `npm start`. Migrations entram no **`npm run build`**, não no start.

4. Se o log mostrar **`uv_thread_create`** / **`WorkerThreadsTaskRunner`**, o Node não consegue criar threads no servidor (comum em **hospedagem compartilhada** com Node “Alt”). Use **VPS** ou o produto **Node Web App** da Hostinger — ver a **seção 10** em [DEPLOY-HOSTINGER.md](./DEPLOY-HOSTINGER.md).

## Notas

- `/.env*` é ignorado pelo git por padrão (veja `.gitignore`).
- Rotas SEO: `src/app/sitemap.ts` e `src/app/robots.ts`.
