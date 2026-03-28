"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const nav = [
  { href: "/", label: "Início" },
  { href: "/loja", label: "Loja" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/checkout", label: "Contato" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { itemsCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background),white_8%)] backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-full px-2 py-1 focus-visible:outline"
        >
          <span className="grid size-9 place-items-center rounded-full bg-alma-600 text-xs font-semibold tracking-[0.22em] text-white shadow-soft">
            AM
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-[0.18em] uppercase">
              Alma
            </span>
            <span className="text-[11px] tracking-[0.32em] uppercase text-[var(--muted)]">
              Marcenaria
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-full px-4 py-2 text-xs font-medium tracking-[0.22em] uppercase transition",
                  active
                    ? "bg-alma-50 text-alma-800"
                    : "text-[var(--muted)] hover:bg-alma-50 hover:text-alma-800",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carrinho"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold tracking-[0.22em] uppercase transition hover:bg-alma-50 hover:text-alma-900"
          >
            Carrinho{" "}
            <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-alma-50 px-2 py-1 text-[10px] font-semibold tracking-normal text-alma-800">
              {itemsCount}
            </span>
          </Link>
          <Link
            href="/checkout"
            className="hidden items-center justify-center rounded-full bg-alma-600 px-4 py-2 text-xs font-semibold tracking-[0.22em] uppercase text-white transition hover:bg-alma-700 sm:inline-flex"
          >
            Orçamento
          </Link>
        </div>
      </div>
    </header>
  );
}

