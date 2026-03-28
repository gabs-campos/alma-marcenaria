import Image from "next/image";
import type { ProductCategory } from "@prisma/client";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { formatBRL } from "@/lib/money";
import { categoryLabel } from "@/lib/products";

export type ProductCardProps = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  category: ProductCategory;
  imageUrl: string | null;
};

export function ProductCard({
  id,
  name,
  description,
  priceCents,
  category,
  imageUrl,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="relative aspect-[4/3] bg-alma-50">
        {imageUrl ? (
          imageUrl.startsWith("/") ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            // URLs externas: evita configurar remotePatterns para cada host
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,140,149,0.28),transparent_60%),linear-gradient(120deg,rgba(0,114,122,0.12),transparent_55%)]" />
        )}
      </div>
      <div className="p-5">
        <h2 className="text-sm font-semibold leading-snug">{name}</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
          {categoryLabel(category)}
        </p>
        {description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-alma-700">
            {formatBRL(priceCents)}
          </p>
          <AddToCartButton
            product={{
              productId: id,
              name,
              priceCents,
              imageUrl,
            }}
          />
        </div>
      </div>
    </article>
  );
}
