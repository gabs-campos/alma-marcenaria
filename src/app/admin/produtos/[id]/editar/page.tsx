import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Editar produto",
};

export default async function EditarProdutoPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Editar</h2>
          <p className="text-sm text-[var(--muted)]">
            Atualize nome, preço, categoria e descrição.
          </p>
        </div>
        <Link
          href="/admin/produtos"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-alma-700 hover:text-alma-800"
        >
          Voltar
        </Link>
      </div>

      <ProductForm
        mode="edit"
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          category: product.category,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  );
}

