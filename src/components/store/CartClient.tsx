"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatBRL } from "@/lib/money";

function normalizeCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function CartClient() {
  const {
    items,
    subtotalCents,
    shippingCents,
    totalCents,
    setQuantity,
    removeItem,
    clear,
    cep,
    setCep,
    setShipping,
  } = useCart();
  const [shippingLoading, setShippingLoading] = useState(false);

  const canCalcShipping = useMemo(() => cep.replace(/\D/g, "").length === 8, [cep]);

  async function calcShipping() {
    if (!canCalcShipping) return;
    setShippingLoading(true);
    try {
      const res = await fetch(`/api/shipping?cep=${encodeURIComponent(cep)}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as { shippingCents?: number };
      setShipping(typeof data.shippingCents === "number" ? data.shippingCents : null);
    } finally {
      setShippingLoading(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Itens</p>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)] hover:text-alma-800"
            >
              Limpar
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
            <p className="text-sm text-[var(--muted)]">
              Seu carrinho está vazio. Explore a loja para adicionar itens.
            </p>
            <Link
              href="/loja"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-alma-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-alma-700"
            >
              Ir para loja
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((i) => (
              <div
                key={i.productId}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{i.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                      {formatBRL(i.priceCents)} • ID {i.productId}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-alma-700">
                    {formatBRL(i.priceCents * i.quantity)}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Qtd.
                    <input
                      inputMode="numeric"
                      value={i.quantity}
                      onChange={(e) =>
                        setQuantity(i.productId, Number(e.target.value || "1"))
                      }
                      className="ml-2 w-20 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItem(i.productId)}
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)] hover:text-alma-800"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <aside className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm font-semibold">Resumo</p>
        <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatBRL(subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Frete</span>
            <span>
              {shippingCents === null ? "—" : formatBRL(shippingCents)}
            </span>
          </div>
          <div className="h-px bg-[var(--border)]" />
          <div className="flex items-center justify-between text-[var(--foreground)]">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatBRL(totalCents)}</span>
          </div>
        </div>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          CEP
          <input
            inputMode="numeric"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => setCep(normalizeCep(e.target.value))}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
          />
        </label>

        <button
          type="button"
          disabled={!canCalcShipping || shippingLoading}
          onClick={calcShipping}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--foreground)] transition enabled:hover:bg-alma-50 disabled:opacity-50"
        >
          {shippingLoading ? "Calculando..." : "Calcular frete"}
        </button>

        <Link
          href="/checkout"
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-alma-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-alma-700"
        >
          Ir para checkout
        </Link>
      </aside>
    </div>
  );
}

