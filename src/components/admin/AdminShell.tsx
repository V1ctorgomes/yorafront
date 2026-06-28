"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Pedidos", href: "/admin/orders" },
  { label: "Transportadoras", href: "/admin/shipping" },
  { label: "Pagamentos", href: "/admin/payments" },
  { label: "Banners", href: "/admin/banners" },
  { label: "Categorias", href: "/admin/categories" },
  { label: "Coleções", href: "/admin/collections" },
  { label: "Produtos", href: "/admin/products" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearAuthToken();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-yora-sand">
      <header className="border-b border-yora-charcoal/10 bg-yora-charcoal text-yora-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="font-display text-xl tracking-[0.25em]">YORA</p>
            <p className="text-xs tracking-widest text-yora-cream/60 uppercase">
              Painel administrativo
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-yora-cream/80 transition-colors hover:text-yora-cream"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 md:px-6">
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2 text-sm tracking-wide transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-yora-charcoal text-yora-cream"
                    : "text-yora-muted hover:text-yora-charcoal",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
