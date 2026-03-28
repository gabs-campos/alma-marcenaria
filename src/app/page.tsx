import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="bg-[var(--background)]">
      <section className="container grid gap-10 py-12 sm:py-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
        <div className="space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--muted)]">
            Marcenaria autoral em São Paulo
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Móveis sob medida com{" "}
            <span className="text-alma-700">alma de madeira</span>.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[var(--muted)]">
            Peças únicas, desenhadas para o seu espaço, com acabamento artesanal
            e respeito à textura natural da madeira.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/loja"
              className="inline-flex items-center justify-center rounded-full bg-alma-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-alma-700"
            >
              Ver peças disponíveis
            </Link>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--foreground)] transition hover:bg-alma-50"
            >
              Solicitar orçamento
            </Link>
          </div>
        </div>

        <div className="relative h-72 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-soft sm:h-96">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,140,149,0.35),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(177,147,106,0.28),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.06),transparent_55%)]" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--background),white_20%)] p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-alma-700">
              Textura & proporção
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Imagem do portfólio entra aqui (otimizada com next/image).
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="container grid gap-6 py-10 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-alma-700">
              Sob medida
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Projetos pensados para o seu espaço, do desenho ao acabamento.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-alma-700">
              Marcenaria fina
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Encaixes, textura e proporção: atenção total aos detalhes.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-alma-700">
              Peças prontas
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Linha de produtos disponíveis para compra e orçamento rápido.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Destaques da loja
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Últimos produtos cadastrados. Veja todos na loja.
            </p>
          </div>
          <Link
            href="/loja"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-alma-700 hover:text-alma-800"
          >
            Ver todos os produtos
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <p className="text-sm text-[var(--muted)]">
              Ainda não há produtos. Cadastre o primeiro no{" "}
              <Link
                href="/admin/produtos/novo"
                className="font-semibold text-alma-700 underline"
              >
                painel admin
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
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
      </section>
    </div>
  );
}
