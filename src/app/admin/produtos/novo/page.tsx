import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = {
  title: "Novo produto",
};

export default function NovoProdutoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Novo produto</h2>
          <p className="text-sm text-[var(--muted)]">
            Cadastre um produto para exibir na loja.
          </p>
        </div>
        <Link
          href="/admin/produtos"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-alma-700 hover:text-alma-800"
        >
          Voltar
        </Link>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}

