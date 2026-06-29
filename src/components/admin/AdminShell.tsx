"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CreditCard,
  Image,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackageCheck,
  Shapes,
  ShoppingBag,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { clearAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pedidos", href: "/admin/orders", icon: ShoppingBag },
  { label: "Expedição", href: "/admin/expedition", icon: PackageCheck },
  { label: "Promoções", href: "/admin/promotions", icon: Tag },
  { label: "Transportadoras", href: "/admin/shipping", icon: Truck },
  { label: "Pagamentos", href: "/admin/payments", icon: CreditCard },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Categorias", href: "/admin/categories", icon: Shapes },
  { label: "Coleções", href: "/admin/collections", icon: Layers },
  { label: "Produtos", href: "/admin/products", icon: Package },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    clearAuthToken();
    router.push("/admin/login");
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-yora-sand">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-yora-charcoal/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-yora-charcoal/10 bg-yora-charcoal text-yora-cream transition-transform duration-200 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-yora-cream/10 px-5 py-5">
          <div>
            <p className="font-display text-xl tracking-[0.25em]">YORA</p>
            <p className="mt-1 text-[10px] tracking-widest text-yora-cream/50 uppercase">
              Administração
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar menu"
            className="text-yora-cream/70 hover:text-yora-cream md:hidden"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-yora-cream text-yora-charcoal"
                        : "text-yora-cream/75 hover:bg-yora-cream/10 hover:text-yora-cream",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-yora-cream/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-yora-cream/75 transition-colors hover:bg-yora-cream/10 hover:text-yora-cream"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-yora-charcoal/10 bg-yora-cream px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            className="text-yora-charcoal"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-display text-lg tracking-[0.2em] text-yora-charcoal">
            YORA
          </p>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
