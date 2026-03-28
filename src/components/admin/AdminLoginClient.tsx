"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Status = "idle" | "loading" | "error";

export function AdminLoginClient({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const next = useMemo(() => nextPath || "/admin", [nextPath]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("invalid_credentials");
      router.replace(next);
      router.refresh();
    } catch {
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="container grid min-h-[calc(100dvh-8rem)] place-items-center py-10">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft">
        <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Acesse o painel para gerenciar produtos.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Usuário
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
              required
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Senha
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]"
              required
            />
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center rounded-full bg-alma-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition enabled:hover:bg-alma-700 disabled:opacity-60"
          >
            {status === "loading" ? "Entrando..." : "Entrar"}
          </button>

          {status === "error" ? (
            <p className="text-sm text-red-600">Usuário ou senha inválidos.</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

