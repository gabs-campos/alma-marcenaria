import Link from "next/link";
import { CartClient } from "@/components/store/CartClient";

export const metadata = {
  title: "Carrinho",
  description: "Itens selecionados para orçamento/compra na Alma Marcenaria.",
};

export default function CarrinhoPage() {
  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Carrinho</h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            Seu carrinho será conectado ao contexto global no próximo passo.
          </p>
        </div>
        <Link
          href="/loja"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-alma-700 hover:text-alma-800"
        >
          Continuar comprando
        </Link>
      </div>

      <CartClient />
    </div>
  );
}

