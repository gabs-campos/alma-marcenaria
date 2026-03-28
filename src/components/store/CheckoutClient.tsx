"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatBRL } from "@/lib/money";

function normalizeCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

type Status = "idle" | "sending" | "sent" | "error";

export function CheckoutClient() {
  const { subtotalCents, shippingCents, totalCents, items, cep, setCep } =
    useCart();
  const [email, setEmail] = useState("");
  const [whats, setWhats] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const disabled = useMemo(() => status === "sending", [status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cep,
          email,
          whatsapp: whats,
          notes,
          items,
          shippingCents,
        }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container py-10 sm:py-14">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Checkout / Contato
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Informe CEP, e-mail e WhatsApp para finalizarmos o pedido/orçamento.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              CEP
              <input
                required
                inputMode="numeric"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(normalizeCep(e.target.value))}
                disabled={disabled}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              WhatsApp
              <input
                required
                inputMode="tel"
                placeholder="(31) 9xxxx-xxxx"
                value={whats}
                onChange={(e) => setWhats(e.target.value)}
                disabled={disabled}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
              />
            </label>
          </div>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            E-mail
            <input
              required
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
            />
          </label>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Observações (opcional)
            <textarea
              rows={5}
              placeholder="Conte sobre medidas, madeira, acabamento, prazos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={disabled}
              className="mt-2 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
            />
          </label>

          <button
            type="submit"
            disabled={disabled}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-alma-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition enabled:hover:bg-alma-700 disabled:opacity-60"
          >
            {status === "sending" ? "Enviando..." : "Enviar"}
          </button>

          {status === "sent" ? (
            <p className="mt-4 text-sm text-alma-700">
              Recebido! Em breve entraremos em contato.
            </p>
          ) : null}
          {status === "error" ? (
            <p className="mt-4 text-sm text-red-600">
              Não foi possível enviar agora. Tente novamente.
            </p>
          ) : null}
        </form>

        <aside className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm font-semibold">Resumo</p>
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm">
            <div className="flex items-center justify-between text-[var(--muted)]">
              <span>Subtotal</span>
              <span>{formatBRL(subtotalCents)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[var(--muted)]">
              <span>Frete</span>
              <span>
                {shippingCents === null ? "—" : formatBRL(shippingCents)}
              </span>
            </div>
            <div className="my-3 h-px bg-[var(--border)]" />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-alma-700">{formatBRL(totalCents)}</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-[var(--muted)]">
            Seus itens:{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {items.length}
            </span>
          </p>
        </aside>
      </div>
    </div>
  );
}

