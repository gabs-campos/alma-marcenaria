import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { productCategories } from "@/lib/products";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const metadata = {
  title: "Produtos",
};

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--muted)]">
          Total: <span className="font-semibold">{products.length}</span>
        </p>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center justify-center rounded-full bg-alma-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-alma-700"
        >
          Novo produto
        </Link>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="grid min-w-[640px] grid-cols-[3rem_1.4fr_0.7fr_0.6fr_0.7fr] gap-3 border-b border-[var(--border)] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          <div className="text-center">
            <span className="sr-only">Imagem</span>
          </div>
          <div>Produto</div>
          <div>Categoria</div>
          <div>Preço</div>
          <div className="text-right">Ações</div>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-10 text-sm text-[var(--muted)]">
            Nenhum produto cadastrado.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {products.map((p) => {
              const category =
                productCategories.find((c) => c.value === p.category)?.label ??
                p.category;
              return (
                <li key={p.id} className="px-6 py-4">
                  <div className="grid min-w-[640px] grid-cols-[3rem_1.4fr_0.7fr_0.6fr_0.7fr] items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-alma-50">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">
                        {p.description}
                      </p>
                    </div>
                    <div className="text-sm text-[var(--muted)]">{category}</div>
                    <div className="text-sm font-semibold text-alma-700">
                      {formatBRL(p.priceCents)}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/produtos/${p.id}/editar`}
                        className="rounded-full border border-[var(--border)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition hover:bg-alma-50"
                      >
                        Editar
                      </Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

