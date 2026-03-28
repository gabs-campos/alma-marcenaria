"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { productCategories, type ProductDTO } from "@/lib/products";

type Mode = "create" | "edit";
type Status = "idle" | "saving" | "error";
type UploadStatus = "idle" | "uploading" | "error";

function toCents(input: string) {
  const normalized = input.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.round(num * 100));
}

function centsToBRLInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function ProductForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: ProductDTO;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<ProductDTO["category"]>(
    initial?.category ?? "MOVEIS",
  );
  const [price, setPrice] = useState(
    initial ? centsToBRLInput(initial.priceCents) : "0,00",
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      name,
      description,
      category,
      priceCents: toCents(price),
      imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
    }),
    [category, description, imageUrl, name, price],
  );

  async function onImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;

    setUploadMessage(null);
    setUploadStatus("uploading");

    const fd = new FormData();
    fd.set("file", f);

    try {
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        if (data.error === "r2_not_configured" || res.status === 503) {
          setUploadMessage(
            data.message ??
              "R2 não configurado. Preencha R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY e R2_BUCKET_NAME no .env.",
          );
        } else {
          setUploadMessage(
            data.message ??
              (res.status === 401
                ? "Faça login no admin e tente de novo."
                : "Não foi possível enviar a imagem."),
          );
        }
        setUploadStatus("error");
        return;
      }

      if (typeof data.url === "string") {
        setImageUrl(data.url);
        setUploadStatus("idle");
      } else {
        setUploadMessage("Resposta inválida do servidor.");
        setUploadStatus("error");
      }
    } catch {
      setUploadMessage("Falha de rede ao enviar a imagem.");
      setUploadStatus("error");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const url =
        mode === "create"
          ? "/api/products"
          : `/api/products/${encodeURIComponent(String(initial?.id))}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save_failed");
      router.replace("/admin/produtos");
      router.refresh();
    } catch {
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)] sm:col-span-2">
          Nome
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
          />
        </label>

        <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Categoria
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductDTO["category"])}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
          >
            {productCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Preço (R$)
          <input
            required
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
          />
        </label>

        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Imagem (opcional)
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-alma-50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploadStatus === "uploading"}
                onChange={onImageFileChange}
              />
              {uploadStatus === "uploading" ? "Enviando…" : "Enviar do computador"}
            </label>
            {imageUrl ? (
              <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-alma-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
          </div>
          {uploadMessage ? (
            <p className="mt-2 text-sm text-red-600">{uploadMessage}</p>
          ) : null}
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Ou URL da imagem
            <input
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setUploadMessage(null);
                setUploadStatus("idle");
              }}
              placeholder="https://… (Cloudflare R2 ou outro)"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
            />
          </label>
        </div>

        <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)] sm:col-span-2">
          Descrição
          <textarea
            required
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {status === "error" ? (
          <p className="text-sm text-red-600">Não foi possível salvar.</p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex items-center justify-center rounded-full bg-alma-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition enabled:hover:bg-alma-700 disabled:opacity-60"
        >
          {status === "saving" ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

