import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2S3Client, getR2UploadConfig } from "@/lib/r2";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function keyFromSegments(segments: string[] | undefined): string | null {
  if (!segments?.length) return null;
  const key = segments.join("/");
  if (key.includes("..") || !key.startsWith("products/")) return null;
  return key;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const key = keyFromSegments(path);
  if (!key) return new Response("Not found", { status: 404 });

  const cfg = getR2UploadConfig();
  if (!cfg) return new Response("Storage unavailable", { status: 503 });

  const client = getR2S3Client(cfg);

  try {
    const out = await client.send(
      new GetObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
      }),
    );

    const body = out.Body;
    if (!body) return new Response("Not found", { status: 404 });

    const contentType = out.ContentType ?? "application/octet-stream";

    const webStream = body.transformToWebStream();

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    const name = e && typeof e === "object" && "name" in e ? (e as { name: string }).name : "";
    if (name === "NoSuchKey" || name === "NotFound") {
      return new Response("Not found", { status: 404 });
    }
    console.error("[storage]", key, e);
    return new Response("Error", { status: 500 });
  }
}
