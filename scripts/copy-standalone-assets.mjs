import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.warn(
    "[copy-standalone-assets] Pasta .next/standalone não encontrada — nada a copiar (use output: 'standalone' e next build).",
  );
  process.exit(0);
}

await cp(path.join(root, "public"), path.join(standalone, "public"), {
  recursive: true,
});

await mkdir(path.join(standalone, ".next"), { recursive: true });
await cp(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"), {
  recursive: true,
});

console.log("[copy-standalone-assets] public/ e .next/static copiados para .next/standalone/.");
