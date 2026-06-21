import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const footerLinks = {
  loja: [
    { label: "Novidades", href: "/novidades" },
    { label: "Coleções", href: "/colecoes" },
    { label: "Best Sellers", href: "/best-sellers" },
    { label: "Sale", href: "/sale" },
  ],
  ajuda: [
    { label: "Central de ajuda", href: "/ajuda" },
    { label: "Trocas e devoluções", href: "/trocas" },
    { label: "Entrega", href: "/entrega" },
    { label: "Guia de tamanhos", href: "/tamanhos" },
  ],
  institucional: [
    { label: "Sobre a Yora", href: "/sobre" },
    { label: "Lojas", href: "/lojas" },
    { label: "Contato", href: "/contato" },
    { label: "Trabalhe conosco", href: "/carreiras" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-yora-charcoal/10 bg-yora-charcoal text-yora-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl tracking-[0.3em]">YORA</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-yora-cream/70">
            Moda premium para quem vive entre treino, trabalho e presença.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yora-cream/70 transition-colors hover:text-yora-cream"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium tracking-widest uppercase">
            Loja
          </h3>
          <ul className="mt-4 space-y-3">
            {footerLinks.loja.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-yora-cream/70 transition-colors hover:text-yora-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium tracking-widest uppercase">
            Ajuda
          </h3>
          <ul className="mt-4 space-y-3">
            {footerLinks.ajuda.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-yora-cream/70 transition-colors hover:text-yora-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium tracking-widest uppercase">
            Contato
          </h3>
          <ul className="mt-4 space-y-4 text-sm text-yora-cream/70">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <a
                href="mailto:contato@yora.com.br"
                className="transition-colors hover:text-yora-cream"
              >
                contato@yora.com.br
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>São Paulo, Brasil</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-yora-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-yora-cream/50 md:flex-row md:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Yora. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/termos" className="hover:text-yora-cream/80">
              Termos de uso
            </Link>
            <Link href="/privacidade" className="hover:text-yora-cream/80">
              Política de privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
