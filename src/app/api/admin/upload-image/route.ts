import { requireAdmin } from "@/lib/adminAuth";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  getR2UploadConfig,
  messageForR2PutError,
  resolveProductImageContentType,
  uploadProductImageObject,
} from "@/lib/r2";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  if (!getR2UploadConfig()) {
    return Response.json(
      {
        error: "r2_not_configured",
        message:
          "Defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY e R2_BUCKET_NAME no .env. R2_PUBLIC_BASE_URL é opcional.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "invalid_form" }, { status: 400 });
  }

  const entry = form.get("file");
  if (!entry || typeof entry === "string") {
    return Response.json({ error: "no_file" }, { status: 400 });
  }

  const file = entry as File;
  const contentType = resolveProductImageContentType(file.type, file.name);
  if (!contentType) {
    return Response.json(
      {
        error: "invalid_type",
        message:
          "Formato não reconhecido. Use arquivo .png, .jpg, .webp ou .gif (ou envie com tipo MIME de imagem).",
      },
      { status: 400 },
    );
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return Response.json(
      { error: "too_large", message: "Máximo 5 MB por imagem." },
      { status: 400 },
    );
  }

  const body = Buffer.from(await file.arrayBuffer());

  try {
    const { publicUrl } = await uploadProductImageObject({
      body,
      contentType,
    });
    return Response.json({ url: publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "upload_failed";
    if (msg === "r2_not_configured" || msg === "invalid_image_type") {
      return Response.json({ error: msg }, { status: 503 });
    }
    console.error("[upload-image]", e);
    const message = messageForR2PutError(e);
    return Response.json({ error: "upload_failed", message }, { status: 500 });
  }
}
