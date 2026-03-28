"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "idle" | "deleting" | "error";

export function DeleteProductButton({ id }: { id: number }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");

  async function onDelete() {
    if (!confirm("Deletar este produto?")) return;
    setStatus("deleting");
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(String(id))}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete_failed");
      router.refresh();
    } catch {
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={status === "deleting"}
      className="rounded-full border border-[var(--border)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)] transition enabled:hover:bg-red-50 enabled:hover:text-red-700 disabled:opacity-60"
    >
      {status === "deleting" ? "..." : "Deletar"}
    </button>
  );
}

