"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { label: "Novidades", href: "/novidades" },
  { label: "Coleções", href: "/colecoes" },
  { label: "Leggings", href: "/leggings" },
  { label: "Tops", href: "/tops" },
  { label: "Conjuntos", href: "/conjuntos" },
  { label: "Sale", href: "/sale" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-yora-cream/95 backdrop-blur-md">
      <div className="border-b border-yora-charcoal/10 bg-yora-charcoal text-yora-cream">
        <p className="px-4 py-2 text-center text-[11px] tracking-widest uppercase">
          Frete grátis acima de R$349 · 5% OFF no Pix · Parcelamento em 6x
        </p>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <button
          type="button"
          className="p-2 text-yora-charcoal lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/"
          className="font-display text-2xl tracking-[0.3em] text-yora-charcoal md:text-3xl"
        >
          YORA
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs tracking-widest uppercase text-yora-charcoal transition-colors hover:text-yora-taupe"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          <button
            type="button"
            className="p-2 text-yora-charcoal transition-colors hover:text-yora-taupe"
            aria-label="Pesquisar"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/conta"
            className="hidden p-2 text-yora-charcoal transition-colors hover:text-yora-taupe sm:block"
            aria-label="Minha conta"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/carrinho"
            className="p-2 text-yora-charcoal transition-colors hover:text-yora-taupe"
            aria-label="Carrinho"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-yora-charcoal/40 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-[min(320px,85vw)] flex-col bg-yora-cream transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-yora-charcoal/10 px-5 py-4">
          <span className="font-display text-xl tracking-[0.25em]">YORA</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-2"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-5 py-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="border-b border-yora-charcoal/5 py-4 text-sm tracking-widest uppercase text-yora-charcoal transition-colors hover:text-yora-taupe"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-yora-charcoal/10 px-5 py-6">
          <Link
            href="/conta"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 text-sm tracking-wide text-yora-charcoal"
          >
            <User className="h-4 w-4" />
            Minha conta
          </Link>
        </div>
      </aside>
    </header>
  );
}
