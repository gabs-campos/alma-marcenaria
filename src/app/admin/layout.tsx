import Link from "next/link";

export const metadata = {
  title: "Admin",
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-alma-700">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/produtos"
            className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition hover:bg-alma-50"
          >
            Produtos
          </Link>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full bg-alma-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-alma-700"
            >
              Sair
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}

