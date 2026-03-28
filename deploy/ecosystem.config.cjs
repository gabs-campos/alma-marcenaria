/**
 * Exemplo PM2 — VPS Hostinger (Next.js com `npm run build` + `npm run start`).
 *
 * Uso: `pm2 start deploy/ecosystem.config.cjs`
 * Ajuste `cwd` para o caminho real do repositório no servidor.
 * Depois: `pm2 save` e `pm2 startup`.
 *
 * Alternativa com output standalone (após `npm run build:deploy`):
 *   script: ".next/standalone/server.js"
 *   env: { NODE_ENV: "production", HOSTNAME: "0.0.0.0", PORT: 3000 }
 */
module.exports = {
  apps: [
    {
      name: "alma-marcenaria",
      cwd: "/var/www/alma-marcenaria",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 0.0.0.0 -p 3000",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
