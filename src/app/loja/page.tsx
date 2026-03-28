import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import { parseCategoryParam, productCategories } from "@/lib/products";

export const metadata = {
  title: "Loja",
  description:
    "Explore produtos da Alma Marcenaria: móveis, decoração e materiais.",
};

export const dynamic = "force-dynamic";

const filterCategories = [
  { id: "TODOS" as const, label: "Todos", param: undefined },
  ...productCategories.map((c) => ({
    id: c.value,
    label: c.label,
    param: c.value,
  })),
];

type Props = {
  searchParams: Promise<{ categoria?: string }> | { categoria?: string };
};

export default async function LojaPage({ searchParams }: Props) {
  const resolved =
    searchParams instanceof Promise ? await searchParams : searchParams;
  const active = parseCategoryParam(resolved.categoria);

  const products = await prisma.product.findMany({
    where: active ? { category: active } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Loja</h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            Peças cadastradas no painel admin. Use os filtros por categoria.
          </p>
        </div>
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded-full bg-alma-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-alma-700"
        >
          Pedir orçamento
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {filterCategories.map((c) => {
          const isActive = active === c.param || (!active && c.id === "TODOS");
          const href =
            c.param === undefined
              ? "/loja"
              : `/loja?categoria=${encodeURIComponent(c.param)}`;
          return (
            <Link
              key={c.id}
              href={href}
              scroll={false}
              className={[
                "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition",
                isActive
                  ? "border-alma-600 bg-alma-600 text-white"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:bg-alma-50 hover:text-alma-800",
              ].join(" ")}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            Nenhum produto nesta categoria ainda. Cadastre itens em{" "}
            <Link href="/admin/produtos/novo" className="font-semibold text-alma-700 underline">
              Admin → Novo produto
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              description={p.description}
              priceCents={p.priceCents}
              category={p.category}
              imageUrl={p.imageUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
