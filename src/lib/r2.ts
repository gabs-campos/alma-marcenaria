import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

/** Credenciais + bucket (upload e leitura via API). */
export type R2UploadConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

let cachedClient: S3Client | null = null;
let cachedForAccount: string | null = null;

/**
 * Config mínima para usar R2 (sem URL pública do bucket).
 * Se `R2_PUBLIC_BASE_URL` estiver vazio, a URL salva no produto aponta para `/api/storage/...`.
 */
export function getR2UploadConfig(): R2UploadConfig | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export function getR2S3Client(cfg: R2UploadConfig): S3Client {
  if (cachedClient && cachedForAccount === cfg.accountId) return cachedClient;
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
  cachedForAccount = cfg.accountId;
  return cachedClient;
}

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function extensionForImageMime(mime: string): string | null {
  return ALLOWED_TYPES[mime] ?? null;
}

/** Alguns SO/navegadores enviam type vazio ou octet-stream; usa a extensão do arquivo. */
export function inferImageMimeFromFileName(filename: string): string | null {
  const n = filename.toLowerCase();
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".gif")) return "image/gif";
  return null;
}

export function resolveProductImageContentType(
  mimeFromBrowser: string | undefined,
  filename: string,
): string | null {
  const m = mimeFromBrowser?.trim() ?? "";
  if (m && m !== "application/octet-stream" && extensionForImageMime(m)) {
    return m;
  }
  const inferred = inferImageMimeFromFileName(filename);
  if (inferred && extensionForImageMime(inferred)) return inferred;
  if (extensionForImageMime(m)) return m;
  return null;
}

export function messageForR2PutError(e: unknown): string {
  const err = e as { name?: string; Code?: string; message?: string };
  const code = err.name ?? err.Code;
  switch (code) {
    case "InvalidAccessKeyId":
      return "R2: Access Key ID inválida. Confira R2_ACCESS_KEY_ID no .env.";
    case "SignatureDoesNotMatch":
      return "R2: Secret Access Key incorreta ou incompleta. No painel, crie outro token (Manage R2 API Tokens) e copie o Secret inteiro — ele só aparece uma vez.";
    case "AccessDenied":
      return "R2: acesso negado. Verifique se o token tem permissão de escrita neste bucket e se R2_BUCKET_NAME está exatamente igual ao nome no painel.";
    case "NoSuchBucket":
      return "R2: bucket não encontrado. Confira R2_BUCKET_NAME e a região/conta (R2_ACCOUNT_ID).";
    default:
      if (typeof err.message === "string" && err.message.includes("credential")) {
        return "R2: problema nas credenciais. Revise Account ID, Access Key e Secret no .env.";
      }
      return "Não foi possível enviar ao Cloudflare R2. Confira credenciais, nome do bucket e conexão.";
  }
}

/**
 * URL usada no campo `imageUrl` do produto: domínio público R2 (se configurado) ou proxy interno.
 */
export function publicUrlForStorageKey(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (base) return `${base}/${key}`;
  return `/api/storage/${key}`;
}

export async function uploadProductImageObject(params: {
  body: Buffer;
  contentType: string;
}): Promise<{ key: string; publicUrl: string }> {
  const cfg = getR2UploadConfig();
  if (!cfg) throw new Error("r2_not_configured");

  const ext = extensionForImageMime(params.contentType);
  if (!ext) throw new Error("invalid_image_type");

  const key = `products/${randomUUID()}.${ext}`;
  const client = getR2S3Client(cfg);

  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { key, publicUrl: publicUrlForStorageKey(key) };
}
