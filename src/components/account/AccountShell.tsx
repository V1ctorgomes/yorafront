"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Shield,
  User,
  X,
} from "lucide-react";
import { logoutCustomer } from "@/lib/api/auth";
import {
  clearCustomerTokens,
  isCustomerAuthenticated,
} from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/minha-conta", icon: LayoutDashboard },
  { label: "Perfil", href: "/minha-conta/perfil", icon: User },
  { label: "Endereços", href: "/minha-conta/enderecos", icon: MapPin },
  { label: "Pedidos", href: "/minha-conta/pedidos", icon: Package },
  { label: "Segurança", href: "/minha-conta/seguranca", icon: Shield },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  async function handleLogout() {
    await logoutCustomer();
    clearCustomerTokens();
    router.push("/login");
  }

  if (!isCustomerAuthenticated()) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">
            Minha conta
          </h1>
          <p className="mt-1 text-sm text-yora-muted">
            Gerencie seus dados e pedidos
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="border border-yora-charcoal/15 p-2"
          aria-label="Abrir menu da conta"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-yora-charcoal/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute top-0 left-0 flex h-full w-[min(320px,85vw)] flex-col bg-yora-cream p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl">Menu</span>
              <button type="button" onClick={() => setDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <AccountNav
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="mb-6">
            <h1 className="font-display text-3xl text-yora-charcoal">
              Minha conta
            </h1>
            <p className="mt-1 text-sm text-yora-muted">
              Gerencie seus dados e pedidos
            </p>
          </div>
          <AccountNav pathname={pathname} onLogout={handleLogout} />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

function AccountNav({
  pathname,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active =
          item.href === "/minha-conta"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-yora-charcoal text-yora-cream"
                : "text-yora-muted hover:text-yora-charcoal",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onLogout}
        className="mt-4 flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-red-600 hover:text-red-700"
      >
        Sair
      </button>
    </nav>
  );
}
