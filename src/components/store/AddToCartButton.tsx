"use client";

import { useCart, type CartItem } from "@/context/CartContext";

export function AddToCartButton({
  product,
}: {
  product: Omit<CartItem, "quantity">;
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => addItem(product, 1)}
      className="rounded-full bg-alma-600 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-alma-700"
    >
      Adicionar
    </button>
  );
}

