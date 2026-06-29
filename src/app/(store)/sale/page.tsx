import type { Metadata } from "next";
import Image from "next/image";
import { ProductCard } from "@/components/home/ProductCard";
import { fetchProducts } from "@/lib/api/products";
import { getSaleDiscountPercent, hasSalePricing } from "@/lib/product-pricing";

const SALE_BANNER_URL =
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80";

export const metadata: Metadata = {
  title: "Sale | YORA",
  description:
    "Aproveite peças selecionadas com condições especiais por tempo limitado.",
};

export default async function SalePage() {
  const products = await fetchProducts({ isOnSale: true });
  const discounts = products
    .filter(hasSalePricing)
    .map((product) =>
      getSaleDiscountPercent(product.compareAtPrice!, product.basePrice),
    );
  const maxDiscount = discounts.length > 0 ? Math.max(...discounts) : null;

  return (
    <div>
      <section className="relative min-h-[360px] overflow-hidden bg-yora-sand md:min-h-[480px]">
        <Image
          src={SALE_BANNER_URL}
          alt="Sale YORA"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-yora-charcoal/50" />
        <div className="relative mx-auto flex min-h-[360px] max-w-7xl flex-col justify-end px-4 pb-12 md:min-h-[480px] md:px-6 md:pb-16 lg:px-8">
          <p className="text-xs tracking-[0.35em] text-yora-cream/80 uppercase">
            Promoções
          </p>
          <h1 className="mt-3 font-display text-4xl text-yora-cream md:text-6xl">
            Sale
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-yora-cream/90 md:text-base">
            Peças selecionadas com preços especiais. Aproveite enquanto durarem
            os estoques.
          </p>
          {maxDiscount !== null && (
            <p className="mt-4 text-xs tracking-widest text-yora-cream/80 uppercase">
              Até {maxDiscount}% off em produtos selecionados
            </p>
          )}
          <p className="mt-4 text-xs tracking-widest text-yora-cream/70 uppercase">
            {products.length}{" "}
            {products.length === 1 ? "produto" : "produtos"} em promoção
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        {products.length === 0 ? (
          <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-16 text-center">
            <p className="font-display text-2xl text-yora-charcoal">
              Nenhuma promoção no momento
            </p>
            <p className="mt-3 text-sm text-yora-muted">
              Volte em breve para conferir novas ofertas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
