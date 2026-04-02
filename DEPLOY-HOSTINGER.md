# Deploy na Hostinger — Alma Marcenaria

Este app é **Next.js 16** com SSR, **API Routes**, **Prisma + SQLite** e **Cloudflare R2**. É necessário **Node.js em execução contínua** (não basta hospedagem PHP estática).

Documentação Next.js: [Deploying](https://nextjs.org/docs/app/getting-started/deploying) e [output: standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).

Guia Hostinger (Node gerenciado): [How to add a Node.js Web App](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).  
Repositório de referência da Hostinger para Next.js: [hostinger/deploy-nextjs](https://github.com/hostinger/deploy-nextjs) — lá o **Start** recomendado é **`npm run start -- -p $PORT`** (porta alinhada ao proxy; sem isso é comum **503**).

---

## 1. Escolha o tipo de hospedagem

| Trilha | Quando usar |
|--------|-------------|
| **A — Node.js Web App** | Seu plano Hostinger inclui deploy de aplicação **Node** a partir do **Git** (ex.: Cloud/Business, conforme a oferta atual). |
| **B — VPS** | Você tem **VPS KVM** com Ubuntu (ou similar) e vai instalar Node, Nginx e PM2 manualmente. |
| **Não serve** | Hospedagem **só PHP** sem Node — este projeto não roda aí sem mudar de produto ou de provedor. |

---

## 2. Variáveis de ambiente (produção)

Copie [`.env.example`](.env.example) para `.env` no servidor **ou** configure as mesmas chaves no painel da Hostinger. **Nunca commite o `.env`.**

| Variável | Observação |
|----------|------------|
| `DATABASE_URL` | Ver seção SQLite abaixo. |
| `NEXT_PUBLIC_SITE_URL` | URL pública com **`https://`** (ex.: `https://www.sua-loja.com.br`). |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Troque valores padrão. |
| `ADMIN_API_TOKEN` | Opcional; se preenchido, APIs admin também aceitam `Authorization: Bearer …`. |
| `R2_*` | Mesmas chaves do ambiente local; `R2_PUBLIC_BASE_URL` pode ficar vazio (imagens via `/api/storage/...`). |

O cookie do admin usa `Secure` em produção; **HTTPS é obrigatório** para o login funcionar de forma confiável.

---

## 3. SQLite em produção

O Prisma resolve caminhos **relativos** no `DATABASE_URL` em relação à pasta **`prisma/`** (onde está `schema.prisma`). Ex.: `file:./prod.db` → arquivo `prisma/prod.db` dentro do projeto.

### Hostinger Node Web App (deploy Git — pasta `nodejs/`)

O app costuma rodar em um caminho como:

`/home/SEU_USER/domains/SEU_SUBDOMINIO.hostingersite.com/nodejs/`

**Erro comum — SQLite código 14 (“não foi possível abrir o arquivo”):** usar no painel um `DATABASE_URL` copiado de tutorial de **VPS**, por exemplo `file:/var/www/alma-marcenaria/prisma/prod.db`. Nesse ambiente **esse diretório não existe**, então o Prisma falha ao abrir o banco.

**Correção:** no painel de variáveis de ambiente, defina:

```text
DATABASE_URL=file:./prod.db
```

(Ou outro nome, desde que seja **relativo à pasta `prisma/`**, sem `prisma/` duplicado no valor — **não** use `file:./prisma/prod.db`, senão o arquivo seria `prisma/prisma/prod.db`.)

O build (`npm run build`, com `prisma migrate deploy`) cria `prisma/prod.db` no próprio projeto, desde que o processo tenha permissão de escrita na pasta `prisma/`.

### VPS próprio (ex.: `/var/www/...`)

Aí sim faz sentido caminho absoluto real no disco, por exemplo:

`DATABASE_URL=file:/var/www/alma-marcenaria/prisma/prod.db`

### Geral

- Garanta permissão de leitura/escrita no arquivo e na pasta `prisma/`.
- Faça **backup** periódico do `.db`.
- Se o painel **apagar o disco** a cada deploy, o SQLite some — avalie MySQL/PostgreSQL no painel e migração do Prisma.

---

## 4. Pipeline de build (comum)

Na **primeira vez** e após puxar código novo:

```bash
npm ci
```

**Build completo para produção** (gera client Prisma, aplica migrations, build Next):

```bash
npm run build
```

(`npm run build:deploy` é alias do mesmo comando.)

Requer `DATABASE_URL` válido **durante o build** (o `prisma migrate deploy` precisa do banco).

**Subir o app:**

- Modo clássico (após `npm run build`):

  ```bash
  npm run start
  ```

  Na Hostinger (Node Web App), defina o comando de start no painel como **`npm run start -- -p $PORT`** (ver seção 5).

- Modo **standalone** (imagem menor; após `npm run build`):

  ```bash
  npm run start:standalone
  ```

  Defina `PORT` e `HOSTNAME=0.0.0.0` se necessário (VPS atrás do Nginx).

O `postinstall` roda **apenas** `prisma generate` após `npm ci` (leve). **Não** rode `next build` no `postinstall`: o painel já executa o comando de build. As **migrations** rodam no **`npm run build`** (script completo no `package.json`), **não** no `npm start` — ver seção 5 sobre **503**.

---

## 5. Trilha A — Node.js Web App (painel)

1. Conecte o repositório GitHub (branch `main`).
2. **Node:** 20.x LTS (ou versão oferecida e compatível com Next 16).
3. **`DATABASE_URL`:** use `file:./prod.db` (ver seção 3). **Não** use `file:/var/www/...` a menos que esse seja literalmente o caminho do app no servidor.
4. **Install:** `npm ci`
5. **Build:** o preset **Next.js** da Hostinger costuma **fixar** o comando em **`npm run build`** (sem campo editável). Neste repositório, o script **`build`** no `package.json` já inclui **`prisma generate`**, **`prisma migrate deploy`** e **`next build`**, então **não é obrigatório** mudar o comando no painel.  
   Se em outro ambiente você precisar só do Next sem rodar migrations, use **`npm run build:next`**.
6. **Start (Hostinger — importante):** no campo **Start command** do painel, use exatamente o que a Hostinger documenta para Next.js:  
   **`npm run start -- -p $PORT`**  
   ([referência](https://github.com/hostinger/deploy-nextjs/blob/main/README.md)). Só **`npm start`** costuma subir na porta **3000**; se o proxy da plataforma espera a porta em **`$PORT`**, o site fica **503** e o log de “execução” pode mostrar só o **build**, sem linhas do `next start`.  
   Localmente continue usando `npm start` ou `PORT=3000 npm start` como preferir.  
   Não use `prestart` com `prisma migrate deploy`: migrations ficam no **`npm run build`** (pipeline padrão). Se o Prisma rodar no start sem `DATABASE_URL` no runtime, o processo pode abortar antes do Next — outra causa de **503**.
7. Confirme se há **armazenamento persistente** para o arquivo SQLite entre deploys.
8. No painel, se existir opção **“variáveis de ambiente em runtime”** / **produção**, replique **`DATABASE_URL`** (e as demais) para o processo que roda `npm start`, não só para o build.

### Cloudflare R2 no painel

`R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY` vêm do painel **R2 → Manage R2 API Tokens**. O **Secret** costuma ser a string longa mostrada **uma vez**; o **Access Key ID** é outro valor — não inverta os dois.

---

## 6. Trilha B — VPS (Nginx + PM2)

1. Instale **Node.js 20**, **Nginx**, **PM2**, **Certbot** (SSL).
2. Clone o repositório (ex.: `/var/www/alma-marcenaria`), crie `.env` no servidor.
3. `npm ci && npm run build`
4. Exemplo de proxy: [`deploy/nginx-alma-marcenaria.example.conf`](deploy/nginx-alma-marcenaria.example.conf) — ajuste `server_name` e SSL. Os headers **`X-Forwarded-Proto`** e **`Host`** são importantes para o Next.js e cookies em HTTPS.
5. PM2: ajuste `cwd` em [`deploy/ecosystem.config.cjs`](deploy/ecosystem.config.cjs) e rode `pm2 start deploy/ecosystem.config.cjs`, depois `pm2 save` e `pm2 startup`.
6. Firewall: libere **80** e **443**; não exponha a porta do Node publicamente se usar só o Nginx.

---

## 7. Checklist pós-deploy (smoke test)

- [ ] Home e `/loja` carregam com **HTTPS**.
- [ ] `/admin/login` abre; login funciona (cookie em HTTPS).
- [ ] Criar/editar produto no admin.
- [ ] Upload de imagem (R2) e visualização na loja e em `/api/storage/...` se aplicável.
- [ ] Carrinho e checkout (fluxo básico).
- [ ] `robots.txt` e `sitemap.xml` coerentes com `NEXT_PUBLIC_SITE_URL`.

---

## 8. Riscos

- Plano **sem Node**: inviável sem upgrade ou outro provedor.
- **SQLite** + deploy sem persistência: perda de dados.
- **Segredos**: rotacione chaves R2 e senhas se vazaram em desenvolvimento.

## 9. Troubleshooting

| Sintoma | Causa provável | Ação |
|--------|----------------|------|
| `Código de erro 14` / não abre o arquivo do banco | `DATABASE_URL` aponta para pasta que **não existe** (ex.: `/var/www/...` na Hostinger Node) | Use `DATABASE_URL=file:./prod.db` e redeploy com **`npm run build`**. |
| `A tabela main.Product não existe` | Migrations **nunca** rodaram no `prod.db` (ex.: build antigo só com `next build`) | Redeploy com o `package.json` atual: **`npm run build`** já inclui `prisma migrate deploy`. Ou rode `npm run build:next` só se souber que o banco já está migrado. |
| **503** / site fora / log só com **build** | **Porta errada** (Next na 3000, proxy em `$PORT`) **ou** processo não sobe (Prisma no start sem env, crash nativo do Node) | **Start no painel:** `npm run start -- -p $PORT` ([deploy-nextjs](https://github.com/hostinger/deploy-nextjs)). **Build:** deixe o padrão **`npm run build`**. Garanta `DATABASE_URL` no **runtime** se o painel separar build/execução. |
| Login admin não grava cookie | Sem HTTPS em produção | Ative SSL no domínio; `NEXT_PUBLIC_SITE_URL` com `https://` |
| Upload imagem falha | R2: chaves trocadas ou secret truncado | Gere novo token R2 e copie Access Key + Secret completos |
| `uv_thread_create` / `WorkerThreadsTaskRunner` / assertion em `node_platform.cc` | Node **não consegue criar threads** no servidor (limite de processo/thread do **hospedagem compartilhada** / CloudLinux `alt-nodejs`) | Ver seção **10** abaixo |
| Página branca: *Application error* + **Digest** (número) | Exceção no **servidor** ao renderizar (Next.js esconde o stack no browser) | Ver seção **11** abaixo |

---

## 10. Erro nativo do Node: `uv_thread_create` / `WorkerThreadsTaskRunner`

Se o log mostra algo como:

```text
Assertion failed: (0) == (uv_thread_create(t.get(), start_thread, this))
node::WorkerThreadsTaskRunner::DelayedTaskScheduler::Start()
```

e o binário é algo como `/opt/alt/alt-nodejs20/root/bin/node`, isso **não é um bug do Next.js** nem do seu código: o **runtime Node falha ao subir** porque o ambiente (muito comum em **cPanel / hospedagem compartilhada** com Node opcional) **bloqueia ou limita** a criação de threads que o Node precisa para inicializar o V8.

### O que fazer

1. **Confirmar o produto**  
   Este projeto precisa de Node com threads normais. Se você estiver em **hospedagem compartilhada “com Node”** (Alt Node), pode ser **incompatível** com Next.js 16 em produção.

2. **Na Hostinger, prefira um destes caminhos**  
   - **Aplicação Node / Web App** do painel (ambiente pensado para apps Node), **ou**  
   - **VPS** com Ubuntu + Node instalado via **NodeSource/nvm** (binário oficial), Nginx e PM2 — ver trilha B neste guia.

3. **Tentativas rápidas no painel atual** (às vezes ajudam, às vezes não)  
   - Trocar a versão do Node (**18.x** em vez de 20.x, ou o contrário), salvar e redeploy.  
   - Garantir **um único** processo de start (sem várias réplicas / cluster).  
   - Garantir comando de produção: **`npm start`** com `NODE_ENV=production`, **não** `next dev`.

4. **Suporte Hostinger**  
   Abra um ticket anexando o trecho do stderr; pergunte se o plano permite **pthread / worker threads** para Node ou se recomendam **VPS / Node Web App** para Next.js.

### O que **não** resolve na maioria dos casos

- Mudar só `package.json` ou variáveis do Next — o crash ocorre **antes** da aplicação carregar.  
- “Otimizar” o build: o problema é o **processo Node** no servidor, não o tamanho do bundle.

Se após migrar para **VPS** ou **Node Web App** adequado o mesmo comando (`npm start`) funcionar localmente e em outro provedor, isso confirma limitação do ambiente antigo.

---

## 11. “Application error” + Digest (sem detalhe no navegador)

O Next.js mostra isso quando **alguma rota quebra no servidor** (SSR). O **Digest** é só um id interno para correlacionar com o log do processo Node — **o motivo real está no stderr do servidor**, não na página.

### Por que “não aparecem logs”

Depende do painel: muitos só mostram **build**, não o **runtime** do `npm start`. Procure **Logs da aplicação**, **Runtime**, **STDERR** ou use **SSH** / terminal do app, se existir.

### Causas frequentes neste projeto

1. **`NEXT_PUBLIC_SITE_URL` inválida** — vazia, sem `https://`, ou URL malformada. O layout usa isso em `metadataBase`; valor inválido derruba **todas** as páginas. Use exatamente: `https://mintcream-spoonbill-882631.hostingersite.com` (ajuste ao seu subdomínio).

2. **Prisma / SQLite** — `DATABASE_URL=file:./prod.db`, build com **`npm run build`** (inclui migrations). Se o banco não existir ou a tabela não existir, a **home** (`/`) quebra ao listar produtos.

3. **Variáveis de ambiente** — confira no painel todas as chaves de [`.env.example`](.env.example); falta de `DATABASE_URL` em runtime também quebra o Prisma.

### Como depurar

1. No painel Hostinger, abra **tudo** que se chame log (app, Node, deployment, stderr).
2. Rode localmente com as **mesmas** variáveis de produção: `npm run build && NODE_ENV=production npm start` e abra a home.
3. Garanta que o código no Git inclui correções recentes (ex.: `searchParams` assíncrono em `/admin/login`, `metadataBase` tolerante a URL inválida).

Se mesmo assim não houver log, abra ticket na Hostinger pedindo **onde ver stderr do processo Node** em “Node.js Web App”.
