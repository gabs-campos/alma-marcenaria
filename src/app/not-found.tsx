import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container grid min-h-[calc(100dvh-8rem)] place-items-center py-16">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Página não encontrada
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          O endereço pode ter mudado ou não existe. Volte para a página inicial
          ou acesse a loja.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-alma-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-alma-700"
          >
            Ir para início
          </Link>
          <Link
            href="/loja"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] transition hover:bg-alma-50"
          >
            Ver loja
          </Link>
        </div>
      </div>
    </div>
  );
}

