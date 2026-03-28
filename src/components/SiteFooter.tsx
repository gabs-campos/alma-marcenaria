import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="container grid gap-8 py-12 sm:grid-cols-2 sm:items-start">
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.18em] uppercase">
            Alma Marcenaria
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Móveis sob medida, decoração e marcenaria autoral. Produção em São
            Paulo e envios sob consulta.
          </p>
        </div>

        <div className="grid gap-3 sm:justify-end">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium tracking-[0.22em] uppercase">
            <Link href="/termos-de-servico" className="hover:text-alma-700">
              Termos de Serviço
            </Link>
            <Link href="/politica-de-privacidade" className="hover:text-alma-700">
              Política de Privacidade
            </Link>
            <Link href="/admin" className="hover:text-alma-700">
              Admin
            </Link>
          </div>
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Alma Marcenaria. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

