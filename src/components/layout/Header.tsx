"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { MiniCart } from "@/components/cart/MiniCart";
import { useCart } from "@/features/cart/cart-context";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const MOBILE_MENU_TRANSITION_MS = 380;

interface HeaderProps {
  categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuRendered, setMobileMenuRendered] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const { cart, miniCartOpen, setMiniCartOpen } = useCart();
  const mounted = useMounted();

  useEffect(() => {
    if (!mobileOpen) {
      setMobileMenuVisible(false);
      const timer = window.setTimeout(() => {
        setMobileMenuRendered(false);
      }, MOBILE_MENU_TRANSITION_MS);

      return () => window.clearTimeout(timer);
    }

    setMobileMenuRendered(true);
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMobileMenuVisible(true));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mobileOpen]);

  useBodyScrollLock(mobileMenuRendered);

  useEffect(() => {
    if (!mobileMenuRendered) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuRendered]);

  const categoryLinks = categories.map((category) => ({
    label: category.name,
    href: `/categoria/${category.slug}`,
  }));

  const navItems = [
    { label: "Novidades", href: "/novidades" },
    ...categoryLinks,
    { label: "Sale", href: "/sale" },
  ];

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function openMobileMenu() {
    setMiniCartOpen(false);
    setMobileOpen(true);
  }

  function openMiniCart() {
    setMobileOpen(false);
    setMiniCartOpen(true);
  }

  const mobileMenu =
    mounted &&
    mobileMenuRendered &&
    createPortal(
      <>
        <div
          className={cn(
            "mobile-menu-backdrop fixed inset-0 z-[200] bg-yora-charcoal/50 backdrop-blur-[2px] lg:hidden",
            mobileMenuVisible
              ? "mobile-menu-backdrop-open"
              : "mobile-menu-backdrop-closed",
          )}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        <aside
          className="fixed top-0 left-0 z-[201] isolate flex h-dvh w-[min(320px,85vw)] flex-col overflow-hidden bg-yora-cream/90 backdrop-blur-2xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="relative z-10 shrink-0 border-b border-yora-charcoal/10 bg-transparent px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-xl tracking-[0.25em]">YORA</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-2 active:scale-95 transition-transform"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav className="relative z-10 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto bg-transparent px-5 py-6">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "border-b border-yora-charcoal/5 py-4 text-sm tracking-widest uppercase text-yora-charcoal transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-yora-taupe",
                  mobileMenuVisible
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0",
                )}
                style={{
                  transitionDelay: mobileMenuVisible
                    ? `${120 + index * 45}ms`
                    : "0ms",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-10 shrink-0 border-t border-yora-charcoal/10 bg-transparent px-5 py-6">
            <Link
              href="/minha-conta"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-sm tracking-wide text-yora-charcoal"
            >
              <User className="h-4 w-4" />
              Minha conta
            </Link>
          </div>
        </aside>
      </>,
      document.body,
    );

  return (
    <header className="sticky top-0 z-50 bg-yora-cream/70 backdrop-blur-xl border-b border-yora-charcoal/5 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="border-b border-yora-charcoal/10 bg-yora-charcoal text-yora-cream">
        <p className="px-4 py-2 text-center text-[11px] tracking-widest uppercase">
          Frete grátis acima de R$349 · 5% OFF no Pix · Parcelamento em 6x
        </p>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <button
          type="button"
          className="p-2 text-yora-charcoal lg:hidden"
          onClick={openMobileMenu}
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/"
          className="font-display text-2xl tracking-[0.3em] text-yora-charcoal md:text-3xl"
        >
          YORA
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
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
            href="/minha-conta"
            className="hidden p-2 text-yora-charcoal transition-colors hover:text-yora-taupe sm:block"
            aria-label="Minha conta"
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={openMiniCart}
            className="relative p-2 text-yora-charcoal transition-colors hover:text-yora-taupe"
            aria-label="Abrir carrinho"
            aria-expanded={miniCartOpen}
          >
            <ShoppingBag className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-yora-charcoal px-1 text-[10px] font-medium text-yora-cream">
                {cart.itemCount > 9 ? "9+" : cart.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <MiniCart />
      {mobileMenu}
    </header>
  );
}
